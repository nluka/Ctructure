import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import currentConfig from '../config/currentConfig';
import { loadConfig } from '../config/loadConfig';
import tryToFormatFile, {
  IFormatResult,
  logFormatResult,
} from '../tryToFormatFile';
import removeCarriageReturns from '../utility/removeCarriageReturns';
import sleep from '../utility/sleep';
import path = require('path');

export default async function formatWorkspaceFiles(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders === undefined) {
    reportErr('no workspace folders found');
    return;
  }

  console.log('[Ctructure.formatWorkspaceFiles] starting...');

  const startTime = Date.now();

  let totalFilesAttemptedCount = 0;
  let totalFilesFailedCount = 0;
  let logs: string[] = [];

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `[Ctructure.formatWorkspaceFiles] formatting workspace (${workspaceFolders.length} folders)...`,
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
          await formatWorkspaceFolder(wsFolder, logs);
        totalFilesAttemptedCount += filesAttemptedCount;
        totalFilesFailedCount += filesFailedCount;
      }
    },
  );

  if (totalFilesAttemptedCount === 0) {
    reportWarn(`[Ctructure.formatWorkspaceFiles] no source files found`);
    return;
  }

  const secondsElapsed = ((Date.now() - startTime) / 1000).toFixed(3);

  if (currentConfig['formatWorkspaceFiles.showLogs']) {
    await vscode.workspace.openTextDocument({
      content: [
        'Ctructure.formatWorkspaceFiles logs',
        '-----------------------------------',
        logs.join('\n'),
      ].join('\n'),
    });
  }

  let msg = `[Ctructure.formatWorkspaceFiles] formatted ${
    totalFilesAttemptedCount - totalFilesFailedCount
  } file(s) in ${secondsElapsed}s (${totalFilesFailedCount} failed)`;
  if (!currentConfig['formatWorkspaceFiles.showLogs']) {
    msg += `, enable "formatWorkspaceFiles.showLogs" for details`;
  }
  const reporter = totalFilesFailedCount === 0 ? reportInfo : reportWarn;
  reporter(msg);
}

async function formatWorkspaceFolder(
  workspaceFolder: vscode.WorkspaceFolder,
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
      `[Ctructure] skipping ignores for workspace folder "${workspaceFolder.name}" -> ${err.message}`,
    );
  }

  let files = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspaceFolder, '{**/*.c,**/*.h}'),
    new vscode.RelativePattern(
      workspaceFolder,
      `{${excludedGlobPatterns.join(',')}}`,
    ),
  );
  if (files.length === 0) {
    return {
      filesAttemptedCount: 0,
      filesFailedCount: 0,
    };
  }

  loadConfig(workspaceFolder);

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

function reportInfo(msg: string) {
  console.log(msg);
  vscode.window.showInformationMessage(msg);
}

function reportWarn(msg: string) {
  console.warn(msg);
  vscode.window.showWarningMessage(msg);
}

function reportErr(reason: string) {
  const msg = `[Ctructure.formatWorkspaceFiles] failed: ${reason}`;
  console.error(msg);
  vscode.window.showErrorMessage(msg);
}
