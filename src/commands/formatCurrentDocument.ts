import * as vscode from 'vscode';
import { loadConfig } from '../config/loadConfig';
import { reportErr, reportWarn } from './report';
import tryToFormatFile, { logFormatResult } from './tryToFormatFile';

export default async function formatCurrentDocument(): Promise<void> {
  const cmdName = 'formatCurrentDocument';

  const currentFileUri = vscode.window.activeTextEditor?.document.uri;
  if (currentFileUri === undefined) {
    reportErr(cmdName, 'failed: no active file');
    return;
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(currentFileUri);
  if (workspaceFolder === undefined) {
    reportWarn(cmdName, 'no config found in active document workspace');
  } else {
    loadConfig(cmdName, workspaceFolder);
  }

  const res = await tryToFormatFile(currentFileUri.fsPath);

  logFormatResult(res, true);
}
