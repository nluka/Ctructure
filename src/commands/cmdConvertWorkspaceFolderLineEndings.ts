import { writeFile } from 'fs';
import { readFile } from 'fs/promises';
import { ProgressLocation, RelativePattern, window, workspace } from 'vscode';
import addCarriageReturns from '../utility/addCarriageReturns';
import removeCarriageReturns from '../utility/removeCarriageReturns';
import sleep from '../utility/sleep';
import getUserSelectionLineEndingSequence from './getUserSelectionLineEndingSequence';
import getUserSelectionWorkspaceFolder from './getUserSelectionWorkspaceFolder';
import { reportErr, reportInfo, reportWarn } from './report';

export default async function cmdConvertWorkspaceFolderLineEndings(): Promise<void> {
  const cmdName = 'convertWorkspaceFolderLineEndings';

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    reportErr(cmdName, 'failed: no workspace folders found');
    return;
  }

  const wsFolderIndex =
    workspaceFolders.length === 1
      ? 0
      : await getUserSelectionWorkspaceFolder(workspaceFolders);
  if (wsFolderIndex === -1) {
    return;
  }

  const lineEndingSequenceChoice = await getUserSelectionLineEndingSequence();
  if (lineEndingSequenceChoice === undefined) {
    return;
  }

  const lineEndingTransformer =
    lineEndingSequenceChoice === 'crlf'
      ? addCarriageReturns
      : removeCarriageReturns;

  const workspaceFolder = workspaceFolders[wsFolderIndex];
  const files = await workspace.findFiles(
    new RelativePattern(workspaceFolder, '*'),
  );

  let convertedCount = 0;
  let failCount = 0;

  await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: `[Ctructure.${cmdName}] converting "${
        workspaceFolder.name
      }" line endings to ${lineEndingSequenceChoice.toUpperCase()}`,
      cancellable: true,
    },
    async () => {
      // DO NOT REMOVE
      await sleep(5);

      // Launch all work concurrently
      for (const file of files) {
        (async function transformFile() {
          try {
            const fileContents = (await readFile(file.fsPath)).toString();
            writeFile(
              file.fsPath,
              lineEndingTransformer(fileContents),
              (err) => {
                if (err === null) {
                  ++convertedCount;
                } else {
                  ++failCount;
                }
              },
            );
          } catch (err) {
            ++failCount;
          }
        })();
      }

      // Wait for all work to be completed
      while (convertedCount + failCount < files.length) {
        await sleep(5);
      }
    },
  );

  const msg = `converted line endings of ${convertedCount} files (${failCount} failed) in "${workspaceFolder.name}"`;
  const reporter = failCount === 0 ? reportInfo : reportWarn;
  reporter(cmdName, msg);
}
