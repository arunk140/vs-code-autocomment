// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vs-code-autocomment" is now active!');
	if (!isCodexKeySet()) {
		vscode.window.showInformationMessage('Please set the Open AI API Key in the settings', 'Open Settings').then(selection => {
		if (selection === 'Open Settings') {
			vscode.commands.executeCommand('workbench.action.openSettings', 'vs-code-autocomment');
		}});
	} else {
		vscode.window.showInformationMessage('Hello World from vs-code-autocomment!');
	}
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vs-code-autocomment.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
	});

	context.subscriptions.push(disposable);
}

// A Function to check if Codex Key is set
function isCodexKeySet() {
	var extConfig = vscode.workspace.getConfiguration('vs-code-autocomment');
	console.log(extConfig);
	if (extConfig.get('codexKey') === null || extConfig.get('codexKey') === '') {
		return false;
	} else {
		return true;
	}
}



// this method is called when your extension is deactivated
export function deactivate() {}
