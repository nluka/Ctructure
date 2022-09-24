import { workspace } from 'vscode';
import getUserSelectionWorkspaceFolder from '../getUserSelectionWorkspaceFolder';
import { reportErr } from '../report';
import formatWorkspaceFolders from './formatWorkspaceFolders';

export default async function cmdFormatWorkspaceFolder(): Promise<void> {
  const cmdName = 'formatWorkspaceFolder';

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    reportErr(cmdName, 'failed: no workspace folders found');
    return;
  }

  const wsFolderIndex =
    workspaceFolders.length === 1
      ? 0
      : await getUserSelectionWorkspaceFolder(workspaceFolders);

  if (wsFolderIndex !== -1) {
    await formatWorkspaceFolders(cmdName, [workspaceFolders[wsFolderIndex]]);
  }
}
