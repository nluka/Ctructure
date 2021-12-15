import { readFileSync } from "fs";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('*** extension "Ctructure" is now active');

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "Ctructure.formatCurrentFile",
      handleFormatCurrentFile
    )
  );
}

function handleFormatCurrentFile() {
  const currentFilePathName = vscode.window.activeTextEditor?.document.fileName;

  if (currentFilePathName === undefined) {
    const errMessage = "current file is undefined";
    console.error(errMessage);
    vscode.window.showErrorMessage(errMessage);
    return;
  }

  const currentFileBuffer = readFileSync(currentFilePathName);
  console.log(
    "first 10 chars of current file:",
    currentFileBuffer.toString().slice(0, 10)
  );
}

export function deactivate() {}
