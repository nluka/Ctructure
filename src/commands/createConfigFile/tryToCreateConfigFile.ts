import { writeFileSync } from 'fs';
import { window, workspace } from 'vscode';
import { defaultConfigStringified } from '../../config/defaultConfig';
import { reportErr } from '../report';
import path = require('path');

export default function tryToCreateConfigFile(
  cmdName: string,
  workspacePath: string,
  show: boolean,
): void {
  const filePathname = path.resolve(workspacePath, 'ctructureconf.json');
  try {
    writeFileSync(filePathname, defaultConfigStringified);
    if (show) {
      workspace.openTextDocument(filePathname).then((document) => {
        window.showTextDocument(document);
      });
    }
    console.log(`[Ctructure.${cmdName}] created config file "${filePathname}"`);
  } catch (err: any) {
    reportErr(cmdName, err.message);
  }
}
