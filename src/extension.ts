import { statSync, writeFile } from 'fs';
import * as vscode from 'vscode';
import TokenArray from './lexer/TokenArray';
import { tokenizeFile } from './lexer/tokenizeFile';
import printer from './printer/printer';

const MAX_25_BIT_UNSIGNED_VALUE = 33_554_431;

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
    reportError(
      'Ctructure.formatCurrentFile',
      'currentFilePathname is undefined',
    );
    return;
  }

  attemptToFormatFile(currentFilePathname);
}

function attemptToFormatFile(filePathname: string) {
  console.warn('--------------------');
  console.log('Ctructure:');
  console.log(`attempting to format file ${filePathname}`);

  const fileByteCount = statSync(filePathname).size;
  console.log(
    `file size: ${fileByteCount} bytes (${(
      fileByteCount /
      (1024 * 1024)
    ).toFixed(6)} MB)`,
  );
  if (fileByteCount * 8 > MAX_25_BIT_UNSIGNED_VALUE + 1) {
    reportError('files larger than 4 MB are not supported');
    return;
  }

  console.log('');
  console.log(' OPERATION - TIME TAKEN (s)');

  let fileContents: string;
  let tokens: TokenArray;
  let formatted: string;

  try {
    const startTime = Date.now();
    [fileContents, tokens] = tokenizeFile(filePathname);
    console.log(`    lexing - ${(Date.now() - startTime) / 1000}`);
  } catch (err: any) {
    reportError(err, 'lexing');
    return;
  }

  try {
    const startTime = Date.now();
    formatted = printer(fileContents, tokens, 2);
    console.log(`  printing - ${(Date.now() - startTime) / 1000}`);
  } catch (err) {
    reportError(err, 'printing');
    return;
  }

  {
    const startTime = Date.now();
    writeFile(filePathname, formatted, (err) => {
      if (err !== null) {
        reportError(err, 'file write');
        return;
      }
      console.log(`file write - ${(Date.now() - startTime) / 1000}`);
      console.warn('--------------------');
    });
  }
}

function reportError(err: any, whatFailed?: string) {
  if (whatFailed !== undefined) {
    console.error(`${whatFailed} failed: ${err?.message || err}`);
  } else {
    console.error(`${err?.message || err}`);
  }
  console.warn('--------------------');
  vscode.window.showErrorMessage(
    `Failed to format file: ${err?.message || err}`,
  );
}

export function deactivate() {
  console.log('*** EXTENSION DEACTIVATED: Ctructure');
}
