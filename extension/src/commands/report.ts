import { window } from 'vscode';

export function reportInfo(cmdName: string, infoContent: string): void {
  const msg = `[Ctructure.${cmdName}] ${infoContent}`;
  console.log(msg);
  window.showInformationMessage(msg);
}

export function reportWarn(cmdName: string, warningContent: string): void {
  const msg = `[Ctructure.${cmdName}] ${warningContent}`;
  console.warn(msg);
  window.showWarningMessage(msg);
}

export function reportErr(command: string, errContent: string): void {
  const msg = `[Ctructure.${command}] ${errContent}`;
  console.error(msg);
  window.showErrorMessage(msg);
}
