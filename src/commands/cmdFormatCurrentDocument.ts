import { window, workspace } from 'vscode';
import { loadConfig } from '../config/loadConfig';
import { reportErr, reportInfo, reportWarn } from './report';
import { tryToFormatDocument, createLogFormatResult } from './tryToFormat';
import * as vscode from "vscode";
import { outputChannel } from '../extension';

export default async function cmdFormatCurrentDocument(): Promise<void> {
  const cmdName = 'formatCurrentDocument';

  const currentFileUri = window.activeTextEditor?.document.uri;
  if (currentFileUri === undefined) {
    reportErr(cmdName, 'failed: no active file');
    return;
  }

  const workspaceFolder = workspace.getWorkspaceFolder(currentFileUri);
  if (workspaceFolder === undefined) {
    outputChannel.appendLine(`[Ctructure.${cmdName}] WARNING: unable to load config: current document does not belong to a workspace folder`);
    // reportWarn(
    //   cmdName,
    //   'unable to load config: current document does not belong to a workspace folder',
    // );
  } else {
    loadConfig(cmdName, workspaceFolder);
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const result = await tryToFormatDocument(editor);

  const msg = createLogFormatResult(result, false);
  if (result.wasSuccessful) {
    // reportInfo(cmdName, msg);
    outputChannel.appendLine(`[Ctructure.${cmdName}] INFO: ${msg}`);
  } else {
    reportErr(cmdName, msg);
  }
}
