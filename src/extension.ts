import * as vscode from 'vscode';
import * as lp from './languagePrefix';
import axios from 'axios';

interface TabConfig { insertSpaces: boolean; tabSize: number }

export function activate(context: vscode.ExtensionContext) {
	testCodexKey();
	let disposable = vscode.commands.registerCommand('vs-code-autocomment.genCommentFrmSelection', () => {
		if (!isCodexKeySet()) { showSetupKeyPopup(); }
		const editor = vscode.window.activeTextEditor;
		if (!editor) { return; }
		const text = getSelectedText();
		const languageId = vscode.window.activeTextEditor?.document.languageId;
		const selection = editor.selection;
		const lines = text? text.split('\n'):[''];
		const lng = languageId?languageId:'javascript';
		const blankLines = preBlankLineCount(lines);

		const tabConfig = getTabConfig();
		let indentationCount = tabCount(lines[blankLines], tabConfig);
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			"title": "Generating comment ...",
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0 });
			try{
				const comment = await getComment(text, languageId);
				const docString
					= lp.startTokens[lng]
					+ comment
					+ lp.stopTokens[lng]
					+ "\n";
				if (lng === 'python') { indentationCount += 1; }
				const indentation = tabConfig?.insertSpaces? ' '.repeat(tabConfig.tabSize) : '\t';
				const docStringWithIndentation = indentation.repeat(indentationCount) + docString.replace(/\n/g, '\n' + indentation.repeat(indentationCount));
				const docStringWithIndentationTrimmed = docStringWithIndentation.substring(0, docStringWithIndentation.length - indentation.repeat(indentationCount).length);
				editor.edit(editBuilder => {
					let selStartLine = selection.start.line + blankLines;
					if (lng === 'python') { selStartLine += 1; }
					const start = new vscode.Position(selStartLine, 0);
					editBuilder.insert(start, docStringWithIndentationTrimmed);
				});
			} catch (error) {
				vscode.window.showErrorMessage("Error: " + error);
			}
			progress.report({ increment: 100 });
		});
		
	});
	context.subscriptions.push(disposable);
}

/**
* Count the number of the tabs on a line in the text editor
* 
* @param {String} line The string of the line
* @param {Object} tabConfig The configuration of the tabs
* @return {Number} The number of the tabs in the line
*/
function tabCount (line: string, tabConfig: any): number {
	let count = 0;	
	let indentString = tabConfig.insertSpaces ? ' '.repeat(tabConfig.tabSize) : '\t';
	for (let i = 0; i < line.length; i+=indentString.length) {
		if (line.substring(i, i + indentString.length) === indentString) {
			count++;
		} else {
			break;
		}
	}
	return count;
};

/**
* Calculates the number of leading and trailing blank lines in a string
* 
* @param  {String} lines The text to count blank lines in
* @return {Number} The number of blank lines
*/
function preBlankLineCount (lines:string[]): number {
	let count = 0;
	if (lines.length <= 1) { return count; }
	for (let lineNum = 0; lineNum < lines.length; lineNum++) {
		const line = lines[lineNum].trim();
		if (line === '') { count++; }
		else { return count; }
	}
	return count;
};

/**
* Gets the tab configuration
* 
* @param  {Array} data The array of cell header names
* @return {TabConfig|undefined} VSCODE configuration
*/
function getTabConfig(): TabConfig|undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor) { return; }
	return {
		tabSize: editor.options.tabSize as number,
		insertSpaces: editor.options.insertSpaces as boolean
	};
}

/**
* Check to see if a key has been set for the Codex service
* 
* @return {Boolean} Whether or not a key has been set
*/
function isCodexKeySet(): boolean {
	let extConfig = vscode.workspace.getConfiguration('vs-code-autocomment');
	if (extConfig.openAI.key.length === 0) {
		return false;
	} else {
		return true;
	}
}

/**
* Test if there is an active Codex key
* 
* @return {void}
*/
function testCodexKey(): void {
	if (!isCodexKeySet()) {
		showSetupKeyPopup();
	}
}

/**
* Generates the command to show a key setup popup
* 
* @return {void}
*/
function showSetupKeyPopup(): void {
	vscode.window.showInformationMessage('Please set the Open AI API Key in the settings', 'Open Settings')
	.then(selection => {
		if (selection === 'Open Settings') {
			vscode.commands.executeCommand('workbench.action.openSettings', 'vs-code-autocomment');
		}
	});
}
	
/**
* Gets selected content
*
* @return {String} The selected text
*/
function getSelectedText(): string|undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor) { return; }
	const start = new vscode.Position(editor.selection.start.line, 0);
	const range = new vscode.Range(start, editor.selection.end);
	if (range.isEmpty) { return; }
	return editor.document.getText(range);
}

/**
* Generates a prefix for a language
* 
* @param {string} languageId The language identifier, there should be a corresponding property
*			in the languagePrefix module
* @return {string} The full language prefix for all examples
*/
function structureLangPrefix(languageId: string): string {
	if (languageId === undefined) { return ''; }
	
	const langExamples = lp.languages[languageId];
	const langStopToken = lp.stopTokens[languageId];
	const langGenString = lp.generateStr[languageId];
	var prefix = '';

	langExamples.forEach(ex => {
		prefix 
		+=  ex.code 
			+ '\n'
			+ langGenString
			+ '\n'
			+ ex.comment
			+ '\n'
			+ langStopToken
			+ '\n';
	});
	return prefix;
}

/**
* Fetch a comment from the OpenAI API
* 
* @param  {String} text The comment body
* @param  {String} languageId Language of the comment
* @return {String} The fetched comment
*/
async function getComment(text: string|undefined, languageId: string|undefined) {
	let logging = vscode.window.createOutputChannel("What's up, Doc?");
	if(text === undefined || languageId === undefined) {
		return 'No text selected';
	}
	var extConfig = vscode.workspace.getConfiguration('vs-code-autocomment');
	const engine:string = extConfig.openAI.engine ?? 'davinci-codex';
	const temperature:number = extConfig.openAI.temperature ?? 0.9;
	const appendExamples:boolean = extConfig.general.appendPredefinedExamples ?? true;

	const url = 'https://api.openai.com/v1/engines/' + engine + '/completions';
	const commentPostfix = "\n" + lp.generateStr[languageId];
	const promptText = (appendExamples?structureLangPrefix(languageId):"") + '\n' + text + commentPostfix;
	
	const body = {
		"prompt": promptText,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		"max_tokens": 100,
		"temperature": temperature,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		"top_p": 1,
		"n": 1,
		"stream": false,
		"logprobs": null,
		"stop": lp.stopTokens[languageId]
	};

	try {
		const response = await postRequest(url, body);
		return response.data.choices[0].text;
	} catch (error) {
		logging.appendLine(error as string);
		logging.show();
	}
}

/**
* Makes an API request to the openAI API
*
* @param  {String} url The url to post to
* @param  {Object} data The data to be posted
* @return {Promise} The promise containing the json response
*/
function postRequest(url: string, data: any): Promise<any> {
	return axios.post(url, data, {
		headers: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'Content-Type': 'application/json',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'Authorization':'Bearer ' + vscode.workspace.getConfiguration('vs-code-autocomment').openAI.key ?? ''
		}
	});
}
// this method is called when your extension is deactivated
export function deactivate() {}
