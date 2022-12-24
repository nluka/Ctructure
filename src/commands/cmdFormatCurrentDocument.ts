import { window, workspace } from 'vscode';
import { loadConfig } from '../config/loadConfig';
import { reportErr, reportInfo, reportWarn } from './report';
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
    reportWarn(
      cmdName,
      'unable to load config: current document does not belong to a workspace folder',
    );
  } else {
    loadConfig(cmdName, workspaceFolder);
  }

  const res = await tryToFormatFile(currentFileUri.fsPath);

  const msg = createLogFormatResult(res, false);
  if (res.wasSuccessful) {
    reportInfo(cmdName, msg);
  } else {
    reportErr(cmdName, msg);
  }
}
