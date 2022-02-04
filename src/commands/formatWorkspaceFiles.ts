import { writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { loadConfig } from '../config/config';
import tryToFormatFile, {
  IFormatResult,
  logFormatResult,
} from '../tryToFormatFile';
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

  loadConfig();

  const tasks: Promise<IFormatResult>[] = [];
  let tasksFailedCount = 0;

  const logFilePathname = path.resolve(
    workspaceFolders[0].uri.fsPath,
    '.ctructurelog',
  );

  writeFileSync(logFilePathname, ''); // Clear file

  // await vscode.window.withProgress(
  //   {
  //     location: vscode.ProgressLocation.Notification,
  //     title: '[Ctructure.formatWorkspaceFiles] formatting...',
  //     cancellable: true,
  //   },
  //   async () => {
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
  //   },
  // );

  if (tasksFailedCount > 0) {
    reportErr(
      `unable to format ${tasksFailedCount}/${tasks.length} files, check "${logFilePathname}" for details`,
    );
  } else {
    vscode.window.showInformationMessage(
      `[Ctructure.formatWorkspaceFiles] successfully formatted ${tasks.length} files, check "${logFilePathname}" for details`,
    );
  }
}

function reportErr(reason: string) {
  const msg = `[Ctructure.formatWorkspaceFiles] failed: ${reason}`;
  console.error(msg);
  vscode.window.showErrorMessage(msg);
}
