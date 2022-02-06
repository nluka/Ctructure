import * as vscode from 'vscode';
import { loadConfig } from '../config/loadConfig';
import tryToFormatFile, { logFormatResult } from '../tryToFormatFile';

export default async function formatCurrentFile() {
  const currentFileUri = vscode.window.activeTextEditor?.document.uri;

  if (currentFileUri === undefined) {
    const msg = `[Ctructure.formatCurrentFile] failed: no active file`;
    console.error(msg);
    vscode.window.showErrorMessage(msg);
    return;
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(currentFileUri);

  if (workspaceFolder === undefined) {
    console.warn(`[Ctructure] no config found in active file\'s workspace`);
  } else {
    loadConfig(workspaceFolder);
  }

  const res = await tryToFormatFile(currentFileUri.fsPath);

  logFormatResult(res, true);
}
