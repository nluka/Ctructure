import TokenCategory from './TokenCategory';
import tokenDetermineLineAndPos from './tokenDetermineLineAndPos';
import tokenValueToTypeMap from './tokenValueToTypeMap';

const commentOrOperatorRegex = /^\/$/,
  preproMacroOrKeywordOrIdentifierOrLabelRegex = /^[a-zA-Z_]$/,
  constantRegex = /^[0-9'"]$/,
  operatorRegex = /^[+\-~!*/%=<>&|^.?:]$/;

/**
 * Determines the category of a token based on its first character.
 * @param fileContents The contents of the file the token exists in.
 * @param tokenStartIndex The index of the token's first character within `fileContents`.
 */
export default function tokenDetermineCategory(
  fileContents: string,
  tokenStartIndex: number,
): TokenCategory {
  const tokenFirstChar = fileContents.charAt(tokenStartIndex);

  if (tokenFirstChar === '\n') {
    return TokenCategory.newline;
  }
  if (tokenFirstChar === '#') {
    return TokenCategory.preproHash;
  }
  if (tokenFirstChar.match(commentOrOperatorRegex)) {
    return TokenCategory.commentOrOperator;
  }
  if (tokenFirstChar.match(preproMacroOrKeywordOrIdentifierOrLabelRegex)) {
    return TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel;
  }
  if (tokenFirstChar.match(constantRegex)) {
    return TokenCategory.constant;
  }
  if (tokenFirstChar.match(operatorRegex)) {
    return TokenCategory.operator;
  }
  if (tokenValueToTypeMap.get(tokenFirstChar) !== undefined) {
    return TokenCategory.special;
  }

  const { lineNum, tokenNum } = tokenDetermineLineAndPos(
    fileContents,
    tokenStartIndex,
  );
  throw new Error(
    `unable to determine category of token at line ${lineNum} tokenNum ${tokenNum} (startIndex=${tokenStartIndex}, firstChar=${JSON.stringify(
      tokenFirstChar,
    )})`,
  );
}
