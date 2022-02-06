import TokenCategory, { tokenCategoryToStringMap } from './TokenCategory';
import tokenDetermineLineAndPos from './tokenDetermineLineAndPos';
import TokenType from './TokenType';
import tokenValueToTypeMap from './tokenValueToTypeMap';

export const commentDirectiveNoFormatSingleLineRegex = /^\/\/.*@ct-no-format/i;
export const commentDirectiveNoFormatMultiLineRegex = /^\/\\*.*@ct-no-format/i;
const commentSingleLineRegex = /^\/\//;

/**
 * Determines a token's type by its category, start position, and end position.
 * May return an ambiguous type.
 * @param fileContents The contents of the file the token exists in.
 * @param tokenStartIndex The index of the token's first character within `fileContents`.
 * @param tokenLastIndex The index of the token's last character within `fileContents`.
 * @param tokenCategory The category of the token.
 */
export default function tokenDetermineType(
  fileContents: string,
  tokenStartIndex: number,
  tokenLastIndex: number,
  tokenCategory: TokenCategory,
): TokenType {
  switch (tokenCategory) {
    case TokenCategory.newline: {
      return TokenType.newline;
    }

    case TokenCategory.preproHash: {
      return TokenType.preproHash;
    }

    case TokenCategory.commentOrOperator: {
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      const type = tokenValueToTypeMap.get(rawToken);
      if (type !== undefined) {
        // operator
        return type;
      }

      // no-format directives
      if (rawToken.match(commentDirectiveNoFormatSingleLineRegex)) {
        return TokenType.commentDirectiveNoFormatSingleLine;
      }
      if (rawToken.match(commentDirectiveNoFormatMultiLineRegex)) {
        return TokenType.commentDirectiveNoFormatMultiLine;
      }

      return rawToken.match(commentSingleLineRegex)
        ? TokenType.commentSingleLine
        : TokenType.commentMultiLine;
    }

    case TokenCategory.constant: {
      const firstChar = fileContents.charAt(tokenStartIndex);
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
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      return tokenValueToTypeMap.get(rawToken) || TokenType.identifier;
    }
  }

  const createErr = () => {
    const { lineNum, tokenNum } = tokenDetermineLineAndPos(
      fileContents,
      tokenStartIndex,
    );
    return new Error(
      `unable to determine type of token at line ${lineNum} tokenNum ${tokenNum} (startIndex=${tokenStartIndex}, lastIndex = ${tokenLastIndex}, category = ${tokenCategoryToStringMap.get(
        tokenCategory,
      )}, value=${JSON.stringify(
        fileContents.slice(tokenStartIndex, tokenLastIndex + 1),
      )})`,
    );
  };

  switch (tokenCategory) {
    case TokenCategory.special: {
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw createErr();
      }
      return type;
    }

    case TokenCategory.operator: {
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw createErr();
      }
      return type;
    }
  }
}
