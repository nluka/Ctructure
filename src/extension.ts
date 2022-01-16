import { writeFile } from 'fs';
import * as vscode from 'vscode';
import format from './format';

export function activate(context: vscode.ExtensionContext) {
  console.log('*** extension "Ctructure" is now active\n');

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'Ctructure.formatCurrentFile',
      handleFormatCurrentFile,
    ),
  );
}

function handleFormatCurrentFile() {
  const currentFilePathName = vscode.window.activeTextEditor?.document.fileName;

  if (currentFilePathName === undefined) {
    const errMessage = 'current file is undefined';
    console.error(errMessage);
    vscode.window.showErrorMessage(errMessage);
    return;
  }

  const formatted = format(currentFilePathName);

  writeFile(currentFilePathName, formatted, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    // file written successfully
  });
}

export function deactivate() {}
