import { writeFile } from 'fs';
import * as vscode from 'vscode';
import format from './format';

export function activate(context: vscode.ExtensionContext) {
  console.log('*** EXTENSION ACTIVATED: Ctructure');

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'Ctructure.formatCurrentFile',
      handleFormatCurrentFile,
    ),
  );
}

function handleFormatCurrentFile() {
  const currentFilePathname = vscode.window.activeTextEditor?.document.fileName;

  if (currentFilePathname === undefined) {
    console.error('format failed: currentFilePathname is undefined');
    vscode.window.showErrorMessage(
      'Failed to format file: currentFilePathname is undefined',
    );
    return;
  }

  try {
    const formatted = format(currentFilePathname);
    writeFile(currentFilePathname, formatted, (err) => {
      if (err !== null) {
        console.error('writeFile failed:', err);
        return;
      }
    });
  } catch (err: any) {
    console.error('format failed:', err);
    vscode.window.showErrorMessage(`Failed to format file: ${err}`);
  }
}

export function deactivate() {}
