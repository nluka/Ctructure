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
    console.error(
      'Ctructure formatting failed: currentFilePathname is undefined',
    );
    vscode.window.showErrorMessage(
      'Failed to format file: currentFilePathname is undefined',
    );
    return;
  }

  try {
    console.log('--------------------');
    console.log('Ctructure:');
    console.log(`attempting to format file ${currentFilePathname}`);
    console.log('');
    console.log(' OPERATION - TIME TAKEN (s)');

    const formatted = format(currentFilePathname);

    const fileWriteStartTime = Date.now();
    writeFile(currentFilePathname, formatted, (err) => {
      if (err !== null) {
        console.error('Ctructure writeFile failed:', err);
        vscode.window.showErrorMessage(`Failed to write file: ${err.message}`);
        return;
      }
    });
    const fileWriteEndTime = Date.now();
    const fileWriteElapsedSecs = (fileWriteEndTime - fileWriteStartTime) / 1000;
    console.log(`file write - ${fileWriteElapsedSecs}`);

    console.log('--------------------');
  } catch (err: any) {
    console.error('Ctructure file formatting failed:', err);
    vscode.window.showErrorMessage(`Failed to format file: ${err.message}`);
  }
}

export function deactivate() {}
