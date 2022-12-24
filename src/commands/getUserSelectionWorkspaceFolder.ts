import { window, WorkspaceFolder } from 'vscode';

/**
 * Gets a workspace folder selection from the user via quick pick.
 * @param workspaceFolders The workspace folders for the user to chooce from.
 * @returns The index of the chosen folder in `workspaceFolders`, or -1 if none were chosen.
 */
export default async function getUserSelectionWorkspaceFolder(
  workspaceFolders: readonly WorkspaceFolder[],
): Promise<number | -1> {
  const choice = await window.showQuickPick(
    workspaceFolders.map(
      // Embed folder index
      (wsFolder) => `${wsFolder.index + 1}: ${wsFolder.uri.fsPath}`,
    ),
    { placeHolder: 'Select Workspace Folder' },
  );

  return choice === undefined
    ? -1
    : // Extract embedded index
      parseInt(choice.substring(0, choice?.indexOf(':'))) - 1;
}
