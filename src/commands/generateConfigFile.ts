import { writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { defaultConfigStringified } from '../config/defaultConfig';
import path = require('path');

export default async function generateConfigFile(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders === undefined) {
    reportErr('no workspace folders found');
    return;
  }

  const workspacePath = workspaceFolders[0].uri.fsPath;
  const filePathname = path.resolve(workspacePath, 'ctructureconf.json');

  try {
    writeFileSync(filePathname, defaultConfigStringified);
  } catch (err: any) {
    reportErr(err.message);
    return;
  }
}

function reportErr(reason: string) {
  const msg = `[Ctructure.generateConfigFile] failed: ${reason}`;
  console.error(msg);
  vscode.window.showErrorMessage(msg);
}
