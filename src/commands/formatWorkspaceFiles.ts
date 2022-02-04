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

  const promises: Promise<IFormatResult>[] = [];
  let rejectedCount = 0; // number of promises that were rejected
  let failedCount = 0; // number of promises that were fulfilled but result indicated failure

  // Launch all work concurrently
  for (const file of workspaceFiles) {
    const filePathname = file.fsPath;
    promises.push(tryToFormatFile(filePathname));
  }

  // Wait for all work to be completed
  const results = await Promise.allSettled(promises);

  const logFilePathname = path.resolve(
    workspaceFolders[0].uri.fsPath,
    '.ctructurelog',
  );

  writeFileSync(logFilePathname, ''); // Clear file

  for (const res of results) {
    if (res.status === 'fulfilled') {
      logFormatResult(res.value, false, logFilePathname);
      if (!res.value.wasSuccessful) {
        ++failedCount;
      }
    } else {
      ++rejectedCount;
    }
  }

  if (failedCount > 0) {
    reportErr(
      `unable to format ${failedCount}/${promises.length} files, check "${logFilePathname}" for details`,
    );
  } else {
    vscode.window.showInformationMessage(
      `[Ctructure.formatWorkspaceFiles] successfully formatted ${promises.length} files, check "${logFilePathname}" for details`,
    );
  }
}

function reportErr(reason: string) {
  const msg = `[Ctructure.formatWorkspaceFiles] failed: ${reason}`;
  console.error(msg);
  vscode.window.showErrorMessage(msg);
}
