import { readFileSync } from 'fs';
import {
  ProgressLocation,
  RelativePattern,
  window,
  workspace,
  WorkspaceFolder,
} from 'vscode';
import currentConfig from '../../config/currentConfig';
import { loadConfig } from '../../config/loadConfig';
import removeCarriageReturns from '../../utility/removeCarriageReturns';
import sleep from '../../utility/sleep';
import { reportInfo, reportWarn } from '../report';
import tryToFormatFile, {
  IFormatResult,
  logFormatResult,
} from '../tryToFormatFile';
import path = require('path');

export default async function formatWorkspaceFolders(
  cmdName: 'formatWorkspaceFolder' | 'formatAllWorkspaceFolders',
  workspaceFolders: readonly WorkspaceFolder[],
): Promise<void> {
  console.log(`[Ctructure.${cmdName}] starting...`);

  const startTime = Date.now();

  let totalFilesAttemptedCount = 0;
  let totalFilesFailedCount = 0;
  let logs: string[] = [];

  await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: `[Ctructure.${cmdName}] formatting ${
        cmdName === 'formatWorkspaceFolder'
          ? `workspace "${workspaceFolders[0].name}"`
          : `all (${workspaceFolders.length}) workspace folders...`
      }`,
      cancellable: true,
    },
    async () => {
      /*
        This is really stupid, but for some reason the progress notification
        doesn't show up until all the work is completed without this small sleep.
        I suspect the tasks launched below compete with the `withProgress`
        promise for the event loop, causing this delayed behavior. - Nick
        DO NOT REMOVE.
      */
      await sleep(5);

      for (const wsFolder of workspaceFolders) {
        const { filesAttemptedCount, filesFailedCount } =
          await formatWorkspaceFolder(cmdName, wsFolder, logs);
        totalFilesAttemptedCount += filesAttemptedCount;
        totalFilesFailedCount += filesFailedCount;
      }
    },
  );

  if (totalFilesAttemptedCount === 0) {
    reportWarn(cmdName, 'no matching source files found');
    return;
  }

  const secondsElapsed = ((Date.now() - startTime) / 1000).toFixed(3);

  if (currentConfig[`${cmdName}.showLogs`]) {
    const header = `Ctructure.${cmdName} logs`;
    await workspace.openTextDocument({
      content: [header, '-'.repeat(header.length), logs.join('\n')].join('\n'),
    });
  }

  let msg = `formatted ${
    totalFilesAttemptedCount - totalFilesFailedCount
  } file(s) in ${secondsElapsed}s (${totalFilesFailedCount} failed)`;
  if (!currentConfig[`${cmdName}.showLogs`]) {
    msg += `, enable "${cmdName}.showLogs" for details`;
  }
  const reporter = totalFilesFailedCount === 0 ? reportInfo : reportWarn;
  reporter(cmdName, msg);
}

async function formatWorkspaceFolder(
  cmdName: 'formatWorkspaceFolder' | 'formatAllWorkspaceFolders',
  workspaceFolder: WorkspaceFolder,
  logs: string[],
): Promise<{
  filesAttemptedCount: number;
  filesFailedCount: number;
}> {
  let excludedGlobPatterns: string[] = [];
  try {
    const ignoreFileContents = removeCarriageReturns(
      readFileSync(
        path.resolve(workspaceFolder.uri.fsPath, '.ctructureignore'),
      ).toString(),
    );
    const patterns = ignoreFileContents.split(/\n+/g);
    for (const pattern of patterns) {
      excludedGlobPatterns.push(pattern);
    }
  } catch (err: any) {
    console.warn(
      `[Ctructure.${cmdName}] skipping ignores for "${workspaceFolder.name}" -> ${err.message}`,
    );
  }

  let files = await workspace.findFiles(
    new RelativePattern(workspaceFolder, '{**/*.c,**/*.h}'),
    new RelativePattern(workspaceFolder, `{${excludedGlobPatterns.join(',')}}`),
  );
  if (files.length === 0) {
    return {
      filesAttemptedCount: 0,
      filesFailedCount: 0,
    };
  }

  loadConfig(cmdName, workspaceFolder);

  const tasks: Promise<IFormatResult>[] = [];
  let filesFailedCount = 0;

  // Launch all work concurrently
  for (const file of files) {
    const filePathname = file.fsPath;
    tasks.push(tryToFormatFile(filePathname));
  }

  // Wait for all work to be completed
  const results = await Promise.allSettled(tasks);

  for (const res of results) {
    if (res.status === 'fulfilled') {
      logs.push(logFormatResult(res.value, false));
      if (!res.value.wasSuccessful) {
        ++filesFailedCount;
      }
    } else {
      ++filesFailedCount;
    }
  }

  return {
    filesAttemptedCount: files.length,
    filesFailedCount,
  };
}
