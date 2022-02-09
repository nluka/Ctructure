import * as vscode from 'vscode';
import { reportErr } from '../report';
import tryToGenerateConfigFile from './tryToGenerateConfig';

export default async function cmdGenerateConfigFileInEveryWorkspaceFolder(): Promise<void> {
  const command = 'generateConfigFileInEveryWorkspaceFolder';

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    reportErr(command, 'failed: no workspace folders found');
    return;
  }

  for (const wsFolder of workspaceFolders) {
    const workspacePath = wsFolder.uri.fsPath;
    tryToGenerateConfigFile(command, workspacePath, false);
  }
}
