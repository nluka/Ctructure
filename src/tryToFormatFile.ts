import { statSync, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import TokenArray from './lexer/TokenArray';
import { tokenizeFile } from './lexer/tokenizeFile';
import printer from './printer/printer';

const BYTES_IN_512_MEGABYTES = 536_870_912;

export interface IFormatResult {
  wasSuccessful: boolean;
  info: IFormatResultInfo | null;
  err: Error | null;
}

export interface IFormatResultInfo {
  fileSize: number;
  lexTime: number;
  printTime: number;
  writeTime: number;
}

export default async function tryToFormatFile(filePathname: string) {
  const fileSize = statSync(filePathname).size;
  if (fileSize > BYTES_IN_512_MEGABYTES) {
    reportErr(
      filePathname,
      new Error(
        `files larger than 512 MB (was ${(fileSize / (1024 * 1024)).toFixed(
          6,
        )}) are not supported`,
      ),
    );
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
    return reportErr(filePathname, err);
  }

  let printTime: number;
  try {
    const startTime = Date.now();
    formatted = printer(fileContents, tokens, 2);
    printTime = (Date.now() - startTime) / 1000;
  } catch (err: any) {
    return reportErr(filePathname, err);
  }

  let writeTime: number;
  try {
    const startTime = Date.now();
    writeFileSync(filePathname, formatted);
    writeTime = (Date.now() - startTime) / 1000;
  } catch (err: any) {
    return reportErr(filePathname, err);
  }

  console.log(
    `[Ctructure] formatted ${filePathname} (lex:${lexTime}s, print:${printTime}s, write:${writeTime}s, total:${
      lexTime + printTime + writeTime
    }s)`,
  );
}

function reportErr(filePathname: string, err: Error) {
  const msg = `[Ctructure.formatCurrentFile] failed to format ${filePathname}: ${err.message}`;
  console.error(msg);
  vscode.window.showErrorMessage(msg);
}
