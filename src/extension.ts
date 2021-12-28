import * as vscode from 'vscode';
import { tokenizeFile } from './lexer/tokenizeFile';
import tokenTypeToNameMap from './lexer/tokenTypeToNameMap';

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

  const [fileContents, tokens] = tokenizeFile(currentFilePathName);

  console.clear();
  console.log('FILE CONTENTS:');
  console.log('--------------------');
  console.log(fileContents);
  console.log('--------------------\n');

  console.log('TOKENS:');
  console.log('number - startIndex - type');
  for (let i = 0; i < tokens.getCount(); ++i) {
    const [startIndex, tokenType] = tokens.getDecoded(i);
    console.log(
      `${i + 1}`.padStart(6),
      '-',
      `${startIndex}`.padStart(10),
      '-',
      tokenTypeToNameMap.get(tokenType),
    );
  }
}

export function deactivate() {}
