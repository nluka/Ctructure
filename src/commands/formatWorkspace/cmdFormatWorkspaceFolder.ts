import { window, workspace } from 'vscode';
import { reportErr } from '../report';
import formatWorkspaceFolders from './formatWorkspaceFolders';

export default async function cmdFormatWorkspaceFolder(): Promise<void> {
  const cmdName = 'formatWorkspaceFolder';

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    reportErr(cmdName, 'failed: no workspace folders found');
    return;
  }

  const folderIndex = await (async function getWorkspaceFolderIndex() {
    if (workspaceFolders.length === 1) {
      return 0;
    }

    // Let user select which workspace folder to format
    const choice = await window.showQuickPick(
      workspaceFolders.map(
        (wsFolder) => `${wsFolder.index + 1}: ${wsFolder.uri.fsPath}`,
      ),
    );

    return choice === undefined
      ? -1
      : parseInt(choice.substring(0, choice?.indexOf(':'))) - 1;
  })();

  if (folderIndex !== -1) {
    await formatWorkspaceFolders(cmdName, [workspaceFolders[folderIndex]]);
  }
}
