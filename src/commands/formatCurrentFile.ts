import * as vscode from 'vscode';
import { loadConfig } from '../config';
import tryToFormatFile from '../tryToFormatFile';

export default async function handleFormatCurrentFile() {
  const currentFilePathname = vscode.window.activeTextEditor?.document.fileName;

  if (currentFilePathname === undefined) {
    const msg = `[Ctructure.formatCurrentFile] failed: currentFilePathname is undefined`;
    console.error(msg);
    vscode.window.showErrorMessage(msg);
    return;
  }

  loadConfig();

  tryToFormatFile(currentFilePathname);
}
