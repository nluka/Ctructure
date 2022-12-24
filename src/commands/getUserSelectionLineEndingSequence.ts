import { window } from 'vscode';

/**
 * Gets a line-ending sequence selection from the user via quick pick.
 */
export default async function getUserSelectionLineEndingSequence(): Promise<
  'lf' | 'crlf' | undefined
> {
  const choice = await window.showQuickPick(['LF (\\n)', 'CRLF (\\r\\n)'], {
    placeHolder: 'Select End of Line Sequence',
  });

  if (choice === undefined) {
    return choice;
  }

  const normalizedChoice = choice.slice(0, choice.indexOf(' ')).toLowerCase();

  if (['LF', 'CRLF'].includes(normalizedChoice)) {
    throw Error('got unexpected value from vscode.window.showQuickPick');
  }

  // @ts-ignore -> we just validated choice above
  return normalizedChoice;
}
