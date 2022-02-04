import { writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { loadConfig } from '../config/config';
import tryToFormatFile, {
  IFormatResult,
  logFormatResult
} from '../tryToFormatFile';
import sleep from '../utility/sleep';
import path = require('path');

export default async function formatWorkspaceFiles() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders === undefined) {
    return reportErr('no workspace folders found');
  }

  const workspaceFiles = await vscode.workspace.findFiles('**/*.[ch]');
  if (workspaceFiles.length === 0) {
    return reportErr('no matching files found in workspace');
  }

  const startTime = Date.now();

  console.log(
    `[Ctructure.formatWorkspaceFiles] attempting to format ${workspaceFiles.length} files...`,
  );

  loadConfig();

  const tasks: Promise<IFormatResult>[] = [];
  let tasksFailedCount = 0;

  const logFilePathname = path.resolve(
    workspaceFolders[0].uri.fsPath,
    '.ctructurelog',
  );

  writeFileSync(logFilePathname, ''); // Clear file

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: '[Ctructure.formatWorkspaceFiles] formatting workspace...',
      cancellable: true,
    },
    async () => {
      /*
        This is really stupid, but for some reason the notification doesn't show
        up until all the work is completed without this small sleep.
        I suspect the tasks we launch below compete with the `withProgress`
        promise for the event loop, causing this delayed behavior. - Nick
        DO NOT REMOVE.
      */
      await sleep(5);

      // Launch all work concurrently
      for (const file of workspaceFiles) {
        const filePathname = file.fsPath;
        tasks.push(tryToFormatFile(filePathname));
      }

      // Wait for all work to be completed
      const results = await Promise.allSettled(tasks);

      for (const res of results) {
        if (res.status === 'fulfilled') {
          logFormatResult(res.value, false, logFilePathname);
          if (!res.value.wasSuccessful) {
            ++tasksFailedCount;
          }
        }
      }
    },
  );

  const secondsElapsed = ((Date.now() - startTime) / 1000).toFixed(3);
  if (tasksFailedCount > 0) {
    reportErr(
      `formatted ${tasks.length - tasksFailedCount}/${
        tasks.length
      } files in ${secondsElapsed}s, check "${logFilePathname}" for details`,
    );
  } else {
    reportInfo(
      `[Ctructure.formatWorkspaceFiles] successfully formatted ${tasks.length} files in ${secondsElapsed}s, check "${logFilePathname}" for details`,
    );
  }
}

function reportErr(reason: string) {
  const msg = `[Ctructure.formatWorkspaceFiles] failed: ${reason}`;
  console.error(msg);
  vscode.window.showErrorMessage(msg);
}

function reportInfo(msg: string) {
  console.log(msg);
  vscode.window.showInformationMessage(msg);
}
