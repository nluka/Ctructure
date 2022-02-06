import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import defaultConfig from './defaultConfig';
import IConfig from './IConfig';
import path = require('path');

export const defaultConfigString = `{
  "indentationSize": 2,
  "indentationType": "spaces",
  "lineWidth": 80,
  "lineEndings": "unix",
  "multiVariableAlwaysNewline": false,
  "multiVariableMatchIndent": true;
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
    const lineWidth = storedConfig.lineWidth;
    if (lineWidth > 0) {
      currentConfig.lineWidth = lineWidth;
    } else {
      warnInvalidPropValue('lineWidth');
    }
  }

  {
    const lineEndings = storedConfig.lineEndings;
    if (
      typeof lineEndings === 'string' &&
      lineEndings.match(/^(lf)|(crlf)$/i)
    ) {
      const firstChar = lineEndings.charAt(0).toLowerCase();
      currentConfig.lineEndings = firstChar === 'l' ? 'LF' : 'CRLF';
    } else {
      warnInvalidPropValue('lineEndings');
    }
  }

  {
    const multiVariableAlwaysNewline = storedConfig.multiVariableAlwaysNewline;
    if (typeof multiVariableAlwaysNewline === 'boolean') {
      currentConfig.multiVariableAlwaysNewline = multiVariableAlwaysNewline;
    } else {
      warnInvalidPropValue('multiVariableAlwaysNewline');
    }
  }

  {
    const multiVariableMatchIndent = storedConfig.multiVariableMatchIndent;
    if (typeof multiVariableMatchIndent === 'boolean') {
      currentConfig.multiVariableMatchIndent = multiVariableMatchIndent;
    } else {
      warnInvalidPropValue('multiVariableMatchIndent');
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
