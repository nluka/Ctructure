import * as vscode from 'vscode';
import { loadConfig } from '../config/config';
import tryToFormatFile, { logFormatResult } from '../tryToFormatFile';

export default async function formatCurrentFile() {
  const currentFilePathname = vscode.window.activeTextEditor?.document.fileName;

  if (currentFilePathname === undefined) {
    const msg = `[Ctructure.formatCurrentFile] failed: currentFilePathname is undefined`;
    console.error(msg);
    vscode.window.showErrorMessage(msg);
    return;
  }

  loadConfig();

  const res = await tryToFormatFile(currentFilePathname);

  logFormatResult(res, true);
}
