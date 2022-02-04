import * as vscode from 'vscode';
import formatCurrentFile from './commands/formatCurrentFile';
import formatWorkspaceFiles from './commands/formatWorkspaceFiles';
import generateConfigFile from './commands/generateConfigFile';

export function activate(context: vscode.ExtensionContext) {
  console.log('[Ctructure] extension activated');

  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    1000,
  );
  item.command = 'Ctructure.formatWorkspaceFiles';

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'Ctructure.formatCurrentFile',
      formatCurrentFile,
    ),
    vscode.commands.registerCommand(
      'Ctructure.formatWorkspaceFiles',
      formatWorkspaceFiles,
    ),
    vscode.commands.registerCommand(
      'Ctructure.generateConfigFile',
      generateConfigFile,
    ),
  );
}

export function deactivate() {
  console.log('[Ctructure] extension deactivated');
}
