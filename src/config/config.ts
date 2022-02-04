import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import defaultConfig from './defaultConfig';
import IConfig from './IConfig';
import path = require('path');

export const defaultConfigString = `{
  "indentationSize": 2,
  "indentationType": "spaces",
  "lineEndings": "unix",
  "multiVariableNewline": false,
  "logToFile": true
}
`;

export const currentConfig: IConfig = { ...defaultConfig };

export function loadConfig() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders === undefined) {
    return;
  }

  const workspacePath = workspaceFolders[0].uri.fsPath;
  const filePathname = path.resolve(workspacePath, 'ctructureconf.json');
  let storedConfig: any;
  try {
    storedConfig = JSON.parse(readFileSync(filePathname).toString());
  } catch (err) {
    return console.warn(
      '[Ctructure] ctructureconf.json not found or unparsable',
    );
  }

  if (typeof storedConfig !== 'object') {
    return;
  }

  {
    const indentationSize = storedConfig.indentationSize;
    if (indentationSize >= 1 && indentationSize <= 10) {
      currentConfig.indentationSize = indentationSize;
    } else {
      warnInvalidPropValue('indentationSize');
    }
  }

  {
    const indentationType = storedConfig.indentationType;
    if (['tabs', 'spaces'].includes(indentationType)) {
      currentConfig.indentationType = indentationType;
    } else {
      warnInvalidPropValue('indentationType');
    }
  }

  {
    const lineEndings = storedConfig.lineEndings;
    if (['unix', 'windows'].includes(lineEndings)) {
      currentConfig.lineEndings = lineEndings;
    } else {
      warnInvalidPropValue('lineEndings');
    }
  }

  {
    const multiVariableNewline = storedConfig.multiVariableNewline;
    if (typeof multiVariableNewline === 'boolean') {
      currentConfig.multiVariableNewline = multiVariableNewline;
    } else {
      warnInvalidPropValue('multiVariableNewline');
    }
  }

  {
    const logToFile = storedConfig.logToFile;
    if (typeof logToFile === 'boolean') {
      currentConfig.logToFile = logToFile;
    } else {
      warnInvalidPropValue('logToFile');
    }
  }

  console.log('[Ctructure] config:', currentConfig);
}

function warnInvalidPropValue(property: string) {
  console.warn(`[Ctructure] invalid ${property} value in config`);
}
