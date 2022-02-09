import { window, workspace } from 'vscode';
import { reportErr } from '../report';
import tryToCreateConfigFile from './tryToCreateConfigFile';

export default async function cmdCreateConfigFile(): Promise<void> {
  const command = 'createConfigFile';

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    reportErr(command, 'failed: no workspace folders found');
    return;
  }

  const workspacePath = await (async function getWorkspacePath() {
    if (workspaceFolders.length === 1) {
      return workspaceFolders[0].uri.fsPath;
    }

    // Let user select which workspace folder to generate file in
    const choice = await window.showQuickPick(
      workspaceFolders.map(
        (wsFolder) => `${wsFolder.index + 1}: ${wsFolder.name}`,
      ),
    );

    return choice || choice?.substring(choice.indexOf(':') + 1);
  })();

  if (workspacePath !== undefined) {
    // User made a selection
    tryToCreateConfigFile(command, workspacePath, true);
  }
}
