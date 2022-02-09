import * as vscode from 'vscode';
import cmdFormatCurrentDocument from './commands/cmdFormatCurrentDocument';
import cmdCreateConfigFile from './commands/createConfigFile/cmdCreateConfigFile';
import cmdCreateConfigFileInEveryWorkspaceFolder from './commands/createConfigFile/cmdCreateConfigFileInEveryWorkspaceFolder';
import cmdFormatAllWorkspaceFolders from './commands/formatWorkspace/cmdFormatAllWorkspaceFolders';
import cmdFormatWorkspaceFolder from './commands/formatWorkspace/cmdFormatWorkspaceFolder';

export function activate(context: vscode.ExtensionContext) {
  console.log('[Ctructure] extension activated');

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'Ctructure.formatCurrentDocument',
      cmdFormatCurrentDocument,
    ),
    vscode.commands.registerCommand(
      'Ctructure.formatWorkspaceFolder',
      cmdFormatWorkspaceFolder,
    ),
    vscode.commands.registerCommand(
      'Ctructure.formatAllWorkspaceFolders',
      cmdFormatAllWorkspaceFolders,
    ),
    vscode.commands.registerCommand(
      'Ctructure.createConfigFile',
      cmdCreateConfigFile,
    ),
    vscode.commands.registerCommand(
      'Ctructure.createConfigFileInEveryWorkspaceFolder',
      cmdCreateConfigFileInEveryWorkspaceFolder,
    ),
  );
}

export function deactivate() {
  console.log('[Ctructure] extension deactivated');
}
