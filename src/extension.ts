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

    let formatted: string;

    {
      const result = format(currentFilePathname);
      formatted = result.formatted;
      console.log('');
      console.log(' OPERATION - TIME TAKEN (s)');
      console.log(`    lexing - ${result.lexerElapsedSeconds}`);
      console.log(`  printing - ${result.printerElapsedSeconds}`);
    }

    {
      const startTime = Date.now();
      writeFile(currentFilePathname, formatted, (err) => {
        if (err !== null) {
          console.error('Ctructure writeFile failed:', err);
          vscode.window.showErrorMessage(
            `Failed to write file: ${err.message}`,
          );
          return;
        }
      });
      const endTime = Date.now();
      console.log(`file write - ${(endTime - startTime) / 1000}`);
    }
  } catch (err: any) {
    console.error('FAILED:', err.message);
    vscode.window.showErrorMessage(`Failed to format file: ${err.message}`);
  } finally {
    console.log('--------------------');
  }
}

export function deactivate() {
  console.log('*** EXTENSION DEACTIVATED: Ctructure');
}
