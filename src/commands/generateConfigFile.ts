import { writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { defaultConfigString as defaultConfigStr } from '../config/config';
import path = require('path');

export default async function generateConfigFile() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders === undefined) {
    return reportErr('no workspace folders found');
  }

  const workspacePath = workspaceFolders[0].uri.fsPath;
  const filePathname = path.resolve(workspacePath, 'ctructureconf.json');

  try {
    writeFileSync(filePathname, defaultConfigStr);
  } catch (err: any) {
    return reportErr(err.message);
  }
}

function reportErr(reason: string) {
  const msg = `[Ctructure.generateConfigFile] failed: ${reason}`;
  console.error(msg);
  vscode.window.showErrorMessage(msg);
}
