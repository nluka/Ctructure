import TokenCategory, { tokenCategoryToStringMap } from './TokenCategory';
import tokenDetermineLineAndIndex from './tokenDetermineLineAndIndex';
import TokenType from './TokenType';
import tokenValueToTypeMap from './tokenValueToTypeMap';

/**
 * Determines a token's type given its category, start position, and end position.
 * May return an ambiguous type.
 * @param fileContents The contents of the file the token exists in.
 * @param tokenStartIndex The index of the token's first character within `fileContents`.
 * @param tokenLastIndex The index of the token's last character within `fileContents`.
 * @param tokenCategory The category of the token.
 * @returns The precise type of the token, or an ambiguous type if there is ambiguity.
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
        return type;
      }
      // We have a comment
      const commentFirstTwoChars = rawToken.slice(0, 2);
      return commentFirstTwoChars === '//'
        ? TokenType.commentSingleline
        : TokenType.commentMultiline;
    }

    case TokenCategory.constant: {
      const firstChar = fileContents.charAt(tokenStartIndex);
      switch (firstChar) {
        case '"':
          return TokenType.constantString;
        case "'":
          return TokenType.constantCharacter;
        default:
          return TokenType.constantNumber;
      }
    }

    case TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel: {
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      if (rawToken.charAt(rawToken.length - 1) === ':') {
        return TokenType.label;
      }
      return tokenValueToTypeMap.get(rawToken) || TokenType.identifier;
    }
  }

  function createErr() {
    const { lineNum, indexOnLine } = tokenDetermineLineAndIndex(
      fileContents,
      tokenStartIndex,
    );
    return new Error(
      `unable to determine type of token at line ${lineNum} indexOnLine ${indexOnLine} (startIndex = ${tokenStartIndex}, lastIndex = ${tokenLastIndex}, category = ${tokenCategoryToStringMap.get(
        tokenCategory,
      )}, value = ${JSON.stringify(
        fileContents.slice(tokenStartIndex, tokenLastIndex + 1),
      )})`,
    );
  }

  switch (tokenCategory) {
    case TokenCategory.special: {
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw createErr();
      }
      return type;
    }

    // case TokenCategory.preproOrOperator: {
    //   const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
    //   if (rawToken.match(standardHeaderRegex)) {
    //     return TokenType.preproStandardHeader;
    //   }
    //   const type = tokenValueToTypeMap.get(rawToken);
    //   if (type === undefined) {
    //     throw createErr();
    //   }
    //   return type;
    // }

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
