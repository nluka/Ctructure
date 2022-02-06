import { statSync, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import TokenArray from './lexer/TokenArray';
import tokenizeFile from './lexer/tokenizeFile';
import printer from './printer/printer';

const BYTES_IN_512_MEGABYTES = 536_870_912;

export interface IFormatResult {
  filePathname: string;
  wasSuccessful: boolean;
  info: IFormatResultInfo | null;
  err: Error | null;
}

export interface IFormatResultInfo {
  lexTime: number;
  printTime: number;
  writeTime: number;
}

export default async function tryToFormatFile(
  filePathname: string,
): Promise<IFormatResult> {
  const fileSize = statSync(filePathname).size;
  if (fileSize > BYTES_IN_512_MEGABYTES) {
    return {
      filePathname,
      wasSuccessful: false,
      info: null,
      err: new Error(
        `files larger than 512 MB (is ${(fileSize / (1024 * 1024)).toFixed(
          6,
        )} MB) are not supported`,
      ),
    };
  }

  let fileContents: string;
  let tokens: TokenArray;
  let formatted: string;

  let lexTime: number;
  try {
    const startTime = Date.now();
    [fileContents, tokens] = tokenizeFile(filePathname);
    lexTime = (Date.now() - startTime) / 1000;
  } catch (err: any) {
    return { filePathname, wasSuccessful: false, info: null, err };
  }

  let printTime: number;
  try {
    const startTime = Date.now();
    formatted = printer(fileContents, tokens);
    printTime = (Date.now() - startTime) / 1000;
  } catch (err: any) {
    return { filePathname, wasSuccessful: false, info: null, err };
  }

  let writeTime: number;
  try {
    const startTime = Date.now();
    writeFileSync(filePathname, formatted);
    writeTime = (Date.now() - startTime) / 1000;
  } catch (err: any) {
    return { filePathname, wasSuccessful: false, info: null, err };
  }

  return {
    filePathname,
    wasSuccessful: true,
    info: { lexTime, printTime, writeTime },
    err: null,
  };
}

enum LogType {
  success,
  error,
}

/**
 * Generates and logs a message based on `formatResult`.
 * @param formatResult The result to log
 * @param shouldShowErrMsgInWindow If true, will display errors in VSCode window.
 * @returns The generated message.
 */
export function logFormatResult(
  formatResult: IFormatResult,
  shouldShowErrMsgInWindow: boolean,
): string {
  function log(logType: LogType, msg: string) {
    const logger = logType === LogType.error ? console.error : console.log;
    logger(`[Ctructure] ${msg}`);

    if (shouldShowErrMsgInWindow && logType === LogType.error) {
      vscode.window.showErrorMessage(msg);
    }
  }

  const { filePathname, wasSuccessful, info, err } = formatResult;

  if (!wasSuccessful && err !== null) {
    const msg = `failed to format "${filePathname}": ${err.message}`;
    log(LogType.error, msg);
    return msg;
  }

  if (info === null) {
    const msg = `failed to format "${filePathname}" (internal error): wasSuccessful is true but info is null`;
    log(LogType.error, msg);
    return msg;
  }

  const msg = `formatted (in ${(
    info.lexTime +
    info.printTime +
    info.writeTime
  ).toFixed(3)}s) "${filePathname}"`;
  log(LogType.success, msg);
  return msg;
}
