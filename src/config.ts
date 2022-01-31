import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import path = require('path');

export default interface IConfig {
  lineEndings: 'unix' | 'windows';
  indentationType: 'tabs' | 'spaces';
  indentationSize: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  multiVariableNewLine: boolean;
}

export const defaultConfig: IConfig = {
  indentationSize: 2,
  indentationType: 'spaces',
  lineEndings: 'unix',
  multiVariableNewLine: false,
};

export const defaultConfigString = `{
  "indentationSize": 2,
  "indentationType": "spaces",
  "lineEndings": "unix",
  "multiVariableNewLine": "false"
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
    const multiVariableNewLine = storedConfig.multiVariableNewLine;
    if (typeof multiVariableNewLine === 'boolean') {
      currentConfig.multiVariableNewLine = multiVariableNewLine;
    } else {
      warnInvalidPropValue('multiVariableNewLine');
    }
  }

  console.log('[Ctructure] config:', currentConfig);
}

function warnInvalidPropValue(property: string) {
  console.warn(`[Ctructure] invalid ${property} value in config`);
}
