import * as vscode from 'vscode';
import { reportErr } from '../report';
import tryToCreateConfigFile from './tryToCreateConfigFile';

export default async function cmdCreateConfigFileInEveryWorkspaceFolder(): Promise<void> {
  const command = 'createConfigFileInEveryWorkspaceFolder';

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    reportErr(command, 'failed: no workspace folders found');
    return;
  }

  for (const wsFolder of workspaceFolders) {
    const workspacePath = wsFolder.uri.fsPath;
    tryToCreateConfigFile(command, workspacePath, false);
  }
}
