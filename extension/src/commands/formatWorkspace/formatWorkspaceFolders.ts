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
  createLogFormatResult as createLogFormatResult,
  IFormatResult,
} from '../tryToFormatFile';
import path = require('path');

export default async function formatWorkspaceFolders(
  cmdName: 'formatWorkspaceFolder' | 'formatAllWorkspaceFolders',
  workspaceFolders: readonly WorkspaceFolder[],
): Promise<void> {
  console.log(`[Ctructure.${cmdName}] starting...`);

  const startTime = Date.now();

  let totalFilesMatchedCount = 0;
  let totalFilesFailedCount = 0;
  let logs: string[] = [];

  await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: `[Ctructure.${cmdName}] formatting ${
        cmdName === 'formatWorkspaceFolder'
          ? `workspace folder "${workspaceFolders[0].name}"`
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
        try {
          const { filesMatchedCount, filesFailedCount } = await formatFolder(
            cmdName,
            wsFolder,
            logs,
          );
          totalFilesMatchedCount += filesMatchedCount;
          totalFilesFailedCount += filesFailedCount;
        } catch (err) {
          console.error(err);
        }
      }
    },
  );

  if (totalFilesMatchedCount === 0) {
    reportWarn(cmdName, 'no matching source files found');
    return;
  }

  const secondsElapsed = ((Date.now() - startTime) / 1000).toFixed(3);
  const succeededCount = totalFilesMatchedCount - totalFilesFailedCount;
  const currDate = new Date();

  if (currentConfig[`${cmdName}.showLogs`]) {
    const header = `Ctructure.${cmdName} logs (${currDate.toDateString()} ${currDate.toLocaleTimeString()}) ${succeededCount} succeeded, ${totalFilesFailedCount} failed`;
    const document = await workspace.openTextDocument({
      content: [header, '-'.repeat(header.length), logs.join('\n')].join('\n'),
      language: 'log',
    });
    await window.showTextDocument(document);
  }

  let msg = `formatted ${succeededCount} file(s) in ${secondsElapsed}s (${totalFilesFailedCount} failed)`;
  if (!currentConfig[`${cmdName}.showLogs`]) {
    msg += `, enable "${cmdName}.showLogs" for details`;
  }
  const reporter = totalFilesFailedCount === 0 ? reportInfo : reportWarn;
  reporter(cmdName, msg);
}

async function formatFolder(
  cmdName: 'formatWorkspaceFolder' | 'formatAllWorkspaceFolders',
  workspaceFolder: WorkspaceFolder,
  logs: string[],
): Promise<{
  filesMatchedCount: number;
  filesFailedCount: number;
}> {
  const excludedGlobPatterns: string[] = [];
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

  const files = await workspace.findFiles(
    new RelativePattern(workspaceFolder, '{**/*.c,**/*.h}'),
    new RelativePattern(workspaceFolder, `{${excludedGlobPatterns.join(',')}}`),
  );
  if (files.length === 0) {
    return {
      filesMatchedCount: 0,
      filesFailedCount: 0,
    };
  }

  // Load config
  {
    const wasSuccessful = loadConfig(cmdName, workspaceFolder);
    if (!wasSuccessful) {
      // to ensure notification from `loadConfig` has time to appear
      await sleep(10);
    }
  }

  const tasks: Promise<IFormatResult>[] = [];
  let filesFailedCount = 0;

  // Launch all work concurrently
  for (const file of files) {
    const filePathname = file.fsPath;
    tasks.push(tryToFormatFile(filePathname));
  }

  // Wait for all work to be completed
  const results = await Promise.allSettled(tasks);

  const successLogs: string[] = [];

  for (const res of results) {
    if (res.status === 'fulfilled') {
      const log = createLogFormatResult(res.value, true);
      if (!log.startsWith('[F')) {
        successLogs.push(log);
      } else {
        // [FAIL]
        logs.push(log); // This way all fails come first
      }
      if (!res.value.wasSuccessful) {
        ++filesFailedCount;
      }
    } else {
      ++filesFailedCount;
    }
  }

  for (const log of successLogs) {
    logs.push(log);
  }

  return {
    filesMatchedCount: files.length,
    filesFailedCount,
  };
}
