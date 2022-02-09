import { statSync, writeFileSync } from 'fs';
import tokenizeFile from '../lexer/tokenizeFile';
import TokenSet from '../lexer/TokenSet';
import printer from '../printer/printer';

const BYTES_IN_512_MEGABYTES = 536_870_912;

export interface IFormatResult {
  filePathname: string;
  wasSuccessful: boolean;
  info?: IFormatResultInfo;
  err?: Error;
}

export interface IFormatResultInfo {
  lexTime: number;
  printTime: number;
  writeTime: number;
}

export default async function tryToFormatFile(filePathname: string): Promise<
  | {
      filePathname: string;
      wasSuccessful: true;
      info: IFormatResultInfo;
    }
  | {
      filePathname: string;
      wasSuccessful: false;
      err: Error;
    }
> {
  const fileSize = statSync(filePathname).size;
  if (fileSize > BYTES_IN_512_MEGABYTES) {
    return {
      filePathname,
      wasSuccessful: false,
      err: new Error(
        `files larger than 512 MB (is ${(fileSize / (1024 * 1024)).toFixed(
          6,
        )} MB) are not supported`,
      ),
    };
  }

  let fileContents: string;
  let tokSet: TokenSet | null;
  let formattedStr: string;

  let lexTime: number;
  try {
    const startTime = Date.now();
    [fileContents, tokSet] = tokenizeFile(filePathname);
    lexTime = Date.now() - startTime;
  } catch (err: any) {
    return {
      filePathname,
      wasSuccessful: false,
      err,
    };
  }

  let printTime: number;
  try {
    const startTime = Date.now();
    formattedStr = printer(fileContents, tokSet);
    printTime = Date.now() - startTime;
  } catch (err: any) {
    return {
      filePathname,
      wasSuccessful: false,
      err,
    };
  }

  let writeTime: number;
  try {
    const startTime = Date.now();
    writeFileSync(filePathname, formattedStr);
    writeTime = Date.now() - startTime;
  } catch (err: any) {
    return {
      filePathname,
      wasSuccessful: false,
      err,
    };
  }

  return {
    filePathname,
    wasSuccessful: true,
    info: { lexTime, printTime, writeTime },
  };
}

/**
 * Generates a log message based on `formatResult`.
 * @param formatResult The result to log.
 * @returns The generated message.
 */
export function createLogFormatResult(
  formatResult: IFormatResult,
  addTypePrefx: boolean,
): string {
  const { filePathname, wasSuccessful, info, err } = formatResult;

  if (wasSuccessful && info !== undefined) {
    return `${addTypePrefx ? '[info] ' : ''}formatted in ${(
      info.lexTime +
      info.printTime +
      info.writeTime
    ).toFixed(0)} ms "${filePathname}"`;
  }

  if (!wasSuccessful && err !== undefined) {
    return `${addTypePrefx ? '[FAIL] ' : ''}${
      err.message
    } in "${filePathname}"`;
  }

  throw new Error('bad formatResult');
}
