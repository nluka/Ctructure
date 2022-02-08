import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { reportWarn } from '../commands/report';
import currentConfig from './currentConfig';
import path = require('path');

/**
 * Attempts to load config (ctructureconf.json) from a workspace folder.
 * @param workspaceFolder The workspace folder to search.
 */
export function loadConfig(
  cmdName:
    | 'formatCurrentDocument'
    | 'formatWorkspaceFolder'
    | 'formatAllWorkspaceFolders',
  workspaceFolder: vscode.WorkspaceFolder,
): void {
  const filePathname = path.resolve(
    workspaceFolder.uri.fsPath,
    'ctructureconf.json',
  );
  try {
    var storedConfig = JSON.parse(readFileSync(filePathname).toString());
  } catch (err: any) {
    reportWarn(
      cmdName,
      `unable to load config for workspace "${workspaceFolder.name}" ${
        err.message.match(/^ENOENT/)
          ? '-> ctructureconf.json not found'
          : `: ${err.message}`
      }`,
    );
    return;
  }

  if (typeof storedConfig !== 'object') {
    reportWarn(
      cmdName,
      `unable to load config for workspace "${workspaceFolder.name}" -> file content not an object`,
    );
    return;
  }

  function updateProperty(
    prop: string,
    value: any,
    valueValidator: () => boolean,
  ) {
    if (valueValidator()) {
      // @ts-ignore type checking done by `valueValidator`
      currentConfig[property] = value;
    } else {
      reportWarn(cmdName, `invalid "${prop}" value in config`);
    }
  }

  {
    const prop = 'formatAllWorkspaceFolders.showLogs';
    const value = storedConfig[prop];
    updateProperty(prop, value, () => typeof value === 'boolean');
  }

  {
    const prop = 'printer.indentationSize';
    const value = storedConfig[prop];
    updateProperty(prop, value, () => value >= 1 && value <= 10);
  }

  {
    const prop = 'printer.indentationType';
    const value = storedConfig[prop];
    updateProperty(prop, value, () => ['tabs', 'spaces'].includes(value));
  }

  {
    const prop = 'printer.lineEndings';
    const value = storedConfig[prop];
    updateProperty(
      prop,
      value,
      () => typeof value === 'string' && !!value.match(/^(lf)|(crlf)$/),
    );
  }

  {
    const prop = 'printer.lineWidth';
    const value = storedConfig[prop];
    updateProperty(prop, value, () => value > 0);
  }

  {
    const prop = 'printer.multiVariableAlwaysNewline';
    const value = storedConfig[prop];
    updateProperty(prop, value, () => typeof value === 'boolean');
  }

  {
    const prop = 'printer.multiVariableMatchIndent';
    const value = storedConfig[prop];
    updateProperty(prop, value, () => typeof value === 'boolean');
  }

  console.log(`[Ctructure.${cmdName}] loaded config:`, currentConfig);
}
