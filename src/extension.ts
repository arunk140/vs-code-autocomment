import * as vscode from 'vscode';
import * as lp from './languagePrefix';
const axios = require('axios');

export function activate(context: vscode.ExtensionContext) {
	testCodexKey();
	let disposable = vscode.commands.registerCommand('vs-code-autocomment.genCommentFrmSelection', () => {
		if (isCodexKeySet()) {
			const text = getSelectedText();
			const languageId = vscode.window.activeTextEditor?.document.languageId;
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return;
			}
			const selection = editor.selection;
			const lines = text? text.split('\n'):[''];
			const indentationCount = tabCount(lines[0], getTabConfig());
			getComment(text, languageId).then(comment => {
				const docString
					= lp.startTokens[languageId?languageId:'javascript']
					+ comment
					+ lp.stopTokens[languageId?languageId:'javascript']
					+ "\n";
				const docStringWithIndentation = '\t'.repeat(indentationCount) + docString.replace(/\n/g, '\n' + '\t'.repeat(indentationCount));
				const docStringWithIndentationTrimmed = docStringWithIndentation.substring(0, docStringWithIndentation.length - indentationCount);
				editor.edit(editBuilder => {
					editBuilder.insert(selection.start, docStringWithIndentationTrimmed);
				}); 
			}).catch(error => {
				vscode.window.showErrorMessage(error);
			});
		} else {
			showSetupKeyPopup();
		}
	});
	context.subscriptions.push(disposable);
}

function tabCount (line: string, tabConfig: any): number {
	let count = 0;	
	let indentString = tabConfig.insertSpaces ? ' '.repeat(tabConfig.tabSize) : '\t';
	for (let i = 0; i < line.length; i+=indentString.length) {
		if (line.substr(i, indentString.length) === indentString) {
			count++;
		} else {
			break;
		}
	}
	return count;
};

function getTabConfig() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	return {
		tabSize: editor.options.tabSize,
		insertSpaces: editor.options.insertSpaces
	};
}

function isCodexKeySet(): boolean {
	var extConfig = vscode.workspace.getConfiguration('vs-code-autocomment');
	if (extConfig.get('codexKey') === null || extConfig.get('codexKey') === '') {
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
	if (!editor) {
		return;
	}
	const selection = editor.selection;
	if (selection.isEmpty) {
		return;
	}
	return editor.document.getText(selection);
}

function structureLangPrefix(languageId: string): string {
	if (languageId === undefined) {
		return '';
	}
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
	const commentPostfix = "\n" + lp.generateStr[languageId];
	const promptText = structureLangPrefix(languageId) + '\n' + text + commentPostfix;
	const body = {
		"prompt": promptText,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		"max_tokens": 50,
		"temperature": 0,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		"top_p": 1,
		"n": 1,
		"stream": false,
		"logprobs": null,
		"stop": lp.stopTokens[languageId]
	};
	//Check if response is not 401
	try {
		const response = await postRequest('https://api.openai.com/v1/engines/davinci-codex/completions', body);
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
			'Authorization':'Bearer '+vscode.workspace.getConfiguration('vs-code-autocomment').get('codexKey')
		}
	});
}
// this method is called when your extension is deactivated
export function deactivate() {}
