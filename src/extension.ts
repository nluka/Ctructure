import * as vscode from 'vscode';
import formatCurrentFile from './commands/formatCurrentFile';
import generateConfigFile from './commands/generateConfigFile';

export function activate(context: vscode.ExtensionContext) {
  console.log('*** EXTENSION ACTIVATED: Ctructure');

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'Ctructure.generateConfigFile',
      generateConfigFile,
    ),
    vscode.commands.registerCommand(
      'Ctructure.formatCurrentFile',
      formatCurrentFile,
    ),
  );
}

export function deactivate() {
  console.log('*** EXTENSION DEACTIVATED: Ctructure');
}
