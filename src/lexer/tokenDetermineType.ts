import TokenCategory, { tokenCategoryToStringMap } from './TokenCategory';
import tokenDetermineLineAndNum from './tokenDetermineLineAndNum';
import TokenType from './TokenType';
import tokenValueToTypeMap from './tokenValueToTypeMap';

export const commentDirectiveNoFormatSingleLineRegex = /^\/\/.*@ct-no-format/i;
export const commentDirectiveNoFormatMultiLineRegex = /^\/\\*.*@ct-no-format/i;
const commentSingleLineRegex = /^\/\//;

/**
 * Determines a token's type by its category, start position, and end position.
 * May return an ambiguous type.
 * @param fileContents The contents of the file the token exists in.
 * @param tokStartPos The index of the token's first character in `fileContents`.
 * @param tokEndPos The index of the token's last character in `fileContents`.
 * @param tokCategory The category of the token.
 */
export default function tokenDetermineType(
  fileContents: string,
  tokStartPos: number,
  tokEndPos: number,
  tokCategory: TokenCategory,
): TokenType {
  switch (tokCategory) {
    case TokenCategory.newline: {
      return TokenType.newline;
    }

    case TokenCategory.preproHash: {
      return TokenType.preproHash;
    }

    case TokenCategory.commentOrOperator: {
      const rawTok = fileContents.slice(tokStartPos, tokEndPos + 1);
      const type = tokenValueToTypeMap.get(rawTok);
      if (type !== undefined) {
        // operator
        return type;
      }

      // no-format directives
      if (rawTok.match(commentDirectiveNoFormatSingleLineRegex)) {
        return TokenType.commentDirectiveNoFormatSingleLine;
      }
      if (rawTok.match(commentDirectiveNoFormatMultiLineRegex)) {
        return TokenType.commentDirectiveNoFormatMultiLine;
      }

      return rawTok.match(commentSingleLineRegex)
        ? TokenType.commentSingleLine
        : TokenType.commentMultiLine;
    }

    case TokenCategory.constant: {
      const firstChar = fileContents.charAt(tokStartPos);
      switch (firstChar) {
        case `"`:
          return TokenType.constantString;
        case `'`:
          return TokenType.constantCharacter;
        default:
          return TokenType.constantNumber;
      }
    }

    case TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel: {
      const rawTok = fileContents.slice(tokStartPos, tokEndPos + 1);
      return tokenValueToTypeMap.get(rawTok) || TokenType.identifier;
    }
  }

  const createErr = () => {
    const { lineNum, tokenNum } = tokenDetermineLineAndNum(
      fileContents,
      tokStartPos,
    );
    return new Error(
      `cannot determine token type ${tokenNum} on line ${lineNum} (category=${tokenCategoryToStringMap.get(
        tokCategory,
      )}, value=${JSON.stringify(
        fileContents.slice(tokStartPos, tokEndPos + 1),
      )})`,
    );
  };

  switch (tokCategory) {
    case TokenCategory.special: {
      const rawTok = fileContents.slice(tokStartPos, tokEndPos + 1);
      const type = tokenValueToTypeMap.get(rawTok);
      if (type === undefined) {
        throw createErr();
      }
      return type;
    }

    case TokenCategory.operator: {
      const rawTok = fileContents.slice(tokStartPos, tokEndPos + 1);
      const type = tokenValueToTypeMap.get(rawTok);
      if (type === undefined) {
        throw createErr();
      }
      return type;
    }
  }
}
