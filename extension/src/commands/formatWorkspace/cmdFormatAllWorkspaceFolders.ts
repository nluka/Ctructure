import { workspace } from 'vscode';
import { reportErr } from '../report';
import formatWorkspaceFolders from './formatWorkspaceFolders';

export default async function cmdFormatAllWorkspaceFolders(): Promise<void> {
  const cmdName = 'formatAllWorkspaceFolders';

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders === undefined) {
    reportErr(cmdName, 'failed: no workspace folders found');
    return;
  }

  await formatWorkspaceFolders(cmdName, workspaceFolders);
}
