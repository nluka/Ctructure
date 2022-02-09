import { window, workspace } from 'vscode';
import { loadConfig } from '../config/loadConfig';
import { reportErr, reportWarn } from './report';
import tryToFormatFile, { createLogFormatResult } from './tryToFormatFile';

export default async function cmdFormatCurrentDocument(): Promise<void> {
  const cmdName = 'formatCurrentDocument';

  const currentFileUri = window.activeTextEditor?.document.uri;
  if (currentFileUri === undefined) {
    reportErr(cmdName, 'failed: no active file');
    return;
  }

  const workspaceFolder = workspace.getWorkspaceFolder(currentFileUri);
  if (workspaceFolder === undefined) {
    reportWarn(cmdName, 'no config found in active document workspace');
  } else {
    loadConfig(cmdName, workspaceFolder);
  }

  const res = await tryToFormatFile(currentFileUri.fsPath);

  const msg = `[Ctructure.${cmdName}] ${createLogFormatResult(res, false)}`;
  if (res.wasSuccessful) {
    console.log(msg);
    window.showInformationMessage(msg);
  } else {
    console.error(msg);
    window.showErrorMessage(msg);
  }
}
