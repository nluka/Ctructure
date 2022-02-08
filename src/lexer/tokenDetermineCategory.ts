import TokenCategory from './TokenCategory';
import tokenDetermineLineAndNum from './tokenDetermineLineAndNum';
import tokenValueToTypeMap from './tokenValueToTypeMap';

const commentOrOperatorRegex = /^\/$/,
  preproMacroOrKeywordOrIdentifierOrLabelRegex = /^[a-zA-Z_]$/,
  constantRegex = /^[0-9'"]$/,
  operatorRegex = /^[+\-~!*/%=<>&|^.?:]$/;

/**
 * Determines the category of a token based on its first character.
 * @param fileContents The contents of the file the token exists in.
 * @param tokStartPos The index of the token's first character in `fileContents`.
 */
export default function tokenDetermineCategory(
  fileContents: string,
  tokStartPos: number,
): TokenCategory {
  const tokFirstChar = fileContents.charAt(tokStartPos);

  if (tokFirstChar === '\n') {
    return TokenCategory.newline;
  }
  if (tokFirstChar === '#') {
    return TokenCategory.preproHash;
  }
  if (tokFirstChar.match(commentOrOperatorRegex)) {
    return TokenCategory.commentOrOperator;
  }
  if (tokFirstChar.match(preproMacroOrKeywordOrIdentifierOrLabelRegex)) {
    return TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel;
  }
  if (tokFirstChar.match(constantRegex)) {
    return TokenCategory.constant;
  }
  if (tokFirstChar.match(operatorRegex)) {
    return TokenCategory.operator;
  }
  if (tokenValueToTypeMap.get(tokFirstChar) !== undefined) {
    return TokenCategory.special;
  }

  const { lineNum, tokenNum } = tokenDetermineLineAndNum(
    fileContents,
    tokStartPos,
  );
  throw new Error(
    `unable to determine category of token ${tokenNum} on line ${lineNum} (startPos=${tokStartPos}, firstChar=${JSON.stringify(
      tokFirstChar,
    )})`,
  );
}
