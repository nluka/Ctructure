import TokenCategory, { tokenCategoryToStringMap } from './TokenCategory';
import tokenDetermineLineNumAndColNumRaw from './tokenDetermineLineNumAndColNumRaw';
import TokenType from './TokenType';
import tokenValueToTypeMap from './tokenValueToTypeMap';

export default function tokenDetermineType(
  fileContents: string,
  tokenStartIndex: number,
  tokenLastIndex: number,
  tokenCategory: TokenCategory,
): TokenType {
  const createErr = () =>
    createError(fileContents, tokenStartIndex, tokenLastIndex, tokenCategory);

  switch (tokenCategory) {
    case TokenCategory.newline: {
      return TokenType.newline;
    }

    case TokenCategory.special: {
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw createErr();
      }
      return type;
    }

    case TokenCategory.prepro: {
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw createErr();
      }
      return type;
    }

    case TokenCategory.preproOrOperator: {
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      if (rawToken.match(/^<[a-zA-Z]+\.h>$/)) {
        return TokenType.preproStandardHeader;
      }
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw createErr();
      }
      return type;
    }

    case TokenCategory.commentOrOperator: {
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      const type = tokenValueToTypeMap.get(rawToken);
      if (type !== undefined) {
        return type;
      }
      // We have a comment
      const commentStart = rawToken.slice(0, 2);
      if (commentStart === '//') {
        return TokenType.commentSingleline;
      }
      return TokenType.commentMultiline;
    }

    case TokenCategory.operator: {
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw createErr();
      }
      return type;
    }

    case TokenCategory.constant: {
      const firstChar = fileContents.charAt(tokenStartIndex);
      if (firstChar === '"') {
        return TokenType.constantString;
      }
      if (firstChar === "'") {
        return TokenType.constantCharacter;
      }
      return TokenType.constantNumber;
    }

    case TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel: {
      const rawToken = fileContents.slice(tokenStartIndex, tokenLastIndex + 1);
      if (rawToken.charAt(rawToken.length - 1) === ':') {
        return TokenType.label;
      }
      let type = tokenValueToTypeMap.get(rawToken);
      if (type !== undefined) {
        return type;
      }
      type = tokenValueToTypeMap.get(rawToken);
      if (type !== undefined) {
        return type;
      }
      return TokenType.identifier;
    }
  }
}

function createError(
  fileContents: string,
  tokenStartIndex: number,
  tokenLastIndex: number,
  tokenCategory: TokenCategory,
) {
  const [lineNum, colNum] = tokenDetermineLineNumAndColNumRaw(
    fileContents,
    tokenStartIndex,
  );
  return new Error(
    `unable to determine type of token at line ${lineNum} col ${colNum} (startIndex = ${tokenStartIndex}, lastIndex = ${tokenLastIndex}, category = ${tokenCategoryToStringMap.get(
      tokenCategory,
    )}, value = ${JSON.stringify(
      fileContents.slice(tokenStartIndex, tokenLastIndex + 1),
    )})`,
  );
}
