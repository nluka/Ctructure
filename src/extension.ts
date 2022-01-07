import * as vscode from 'vscode';
import * as fs from 'fs';
import formatFile from './formatter/formatter';
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
  const formatted = formatFile([fileContents, tokens]);

  currentFilePathName;

  fs.writeFile(currentFilePathName, formatted, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    //file written successfully
  });

  // console.clear();
  // console.log('FILE CONTENTS:');
  // console.log('--------------------');
  // console.log(fileContents);
  // console.log('--------------------\n');

  // console.log('TOKENS:');
  // console.log('number - startIndex - type');
  // for (let i = 0; i < tokens.getCount(); ++i) {
  //   const [startIndex, tokenType] = tokens.getTokenDecoded(i);
  //   console.log(
  //     `${i + 1}`.padStart(6),
  //     '-',
  //     `${startIndex}`.padStart(10),
  //     '-',
  //     tokenTypeToNameMap.get(tokenType),
  //   );
  // }

  // console.log('\nFORMATTED FILE:');
  // console.log('--------------------');
  // console.log(formatted);
  // console.log('--------------------');
}

export function deactivate() {}
