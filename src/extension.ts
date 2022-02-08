import * as vscode from 'vscode';
import cmdFormatCurrentDocument from './commands/formatCurrentDocument';
import cmdFormatAllWorkspaceFolders from './commands/formatWorkspace/cmdFormatAllWorkspaceFolders';
import cmdFormatWorkspaceFolder from './commands/formatWorkspace/cmdFormatWorkspaceFolder';
import cmdGenerateConfigFile from './commands/generateConfigFile/cmdGenerateConfigFile';

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
      'Ctructure.generateConfigFile',
      cmdGenerateConfigFile,
    ),
  );
}

export function deactivate() {
  console.log('[Ctructure] extension deactivated');
}
