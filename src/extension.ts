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
			title: 'Query Open AI API..',
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

function getTabConfig(): TabConfig|undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor) { return; }
	return {
		tabSize: editor.options.tabSize as number,
		insertSpaces: editor.options.insertSpaces as boolean
	};
}

function isCodexKeySet(): boolean {
	let extConfig = vscode.workspace.getConfiguration('vs-code-autocomment');
	if (extConfig.get('openAI.Key') === null || extConfig.get('openAI.Key') === '') {
		return false;
	} else {
		return true;
	}
}

function testCodexKey(): void {
	if (!isCodexKeySet()) {
		showSetupKeyPopup();
	}
}

function showSetupKeyPopup(): void {
	vscode.window.showInformationMessage('Please set the Open AI API Key in the settings', 'Open Settings')
	.then(selection => {
		if (selection === 'Open Settings') {
			vscode.commands.executeCommand('workbench.action.openSettings', 'vs-code-autocomment');
		}
	});
}
	
function getSelectedText(): string|undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor) { return; }
	const start = new vscode.Position(editor.selection.start.line, 0);
	const range = new vscode.Range(start, editor.selection.end);
	if (range.isEmpty) { return; }
	return editor.document.getText(range);
}

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

async function getComment(text: string|undefined, languageId: string|undefined) {
	if(text === undefined || languageId === undefined) {
		return 'No text selected';
	}
	const engine:string = vscode.workspace.getConfiguration('vs-code-autocomment').get('openAI.Engine') ?? 'davinci-codex';
	const temperature:number = vscode.workspace.getConfiguration('vs-code-autocomment').get('openAI.temperature') ?? 0;
	const appendExamples:boolean = vscode.workspace.getConfiguration('vs-code-autocomment').get('general.appendPredefinedExamples') ?? true;

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
		showSetupKeyPopup();
	}
}

function postRequest(url: string, data: any): Promise<any> {
	return axios.post(url, data, {
		headers: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'Content-Type': 'application/json',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'Authorization':'Bearer ' + vscode.workspace.getConfiguration('vs-code-autocomment').get('openAI.Key') ?? ''
		}
	});
}
// this method is called when your extension is deactivated
export function deactivate() {}
