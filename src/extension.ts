// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as lp from './languagePrefix';
const axios = require('axios');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	testCodexKey();
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vs-code-autocomment.genCommentFrmSelection', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		if (isCodexKeySet()) {
			const text = getSelectedText();
			const languageId = vscode.window.activeTextEditor?.document.languageId;
			getComment(text, languageId).then(comment => {
				const editor = vscode.window.activeTextEditor;
				if (!editor) {
					return;
				}
				const selection = editor.selection;
				editor.edit(editBuilder => {
					const docString
					= lp.startTokens[languageId?languageId:'javascript']
						+ comment
						+ lp.stopTokens[languageId?languageId:'javascript']
						+ "\n";
					editBuilder.insert(selection.start, docString);
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
