import { writeFileSync } from 'fs';
import { defaultConfigStringified } from '../../config/defaultConfig';
import { reportErr } from '../report';
import path = require('path');

export default function tryToGenerateConfigFile(
  command: string,
  workspacePath: string,
): void {
  const filePathname = path.resolve(workspacePath, 'ctructureconf.json');
  try {
    writeFileSync(filePathname, defaultConfigStringified);
  } catch (err: any) {
    reportErr(command, err.message);
  }
}
