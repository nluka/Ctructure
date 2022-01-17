import TokenCategory from './TokenCategory';
import TokenType from './TokenType';
import tokenValueToTypeMap from './tokenValueToTypeMap';

export default function tokenDetermineType(
  fileContents: string,
  startIndex: number,
  lastIndex: number,
  category: TokenCategory,
): TokenType {
  switch (category) {
    case TokenCategory.newline: {
      return TokenType.newline;
    }

    case TokenCategory.special: {
      const rawToken = fileContents.slice(startIndex, lastIndex + 1);
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw new Error(`unknown special token: ${rawToken}`);
      }
      return type;
    }

    case TokenCategory.prepro: {
      const rawToken = fileContents.slice(startIndex, lastIndex + 1);
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw new Error(`unknown preprocessor token: ${rawToken}`);
      }
      return type;
    }

    case TokenCategory.preproOrOperator: {
      const rawToken = fileContents.slice(startIndex, lastIndex + 1);
      if (rawToken.match(/^<[a-zA-Z]+\.h>$/)) {
        return TokenType.preproStandardHeader;
      }
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw new Error(`unknown operator token: ${rawToken}`);
      }
      return type;
    }

    case TokenCategory.commentOrOperator: {
      const rawToken = fileContents.slice(startIndex, lastIndex + 1);
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
      const rawToken = fileContents.slice(startIndex, lastIndex + 1);
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw new Error(`unknown operator token: ${rawToken}`);
      }
      return type;
    }

    case TokenCategory.constant: {
      const firstChar = fileContents.charAt(startIndex);
      if (firstChar === '"') {
        return TokenType.constantString;
      }
      if (firstChar === "'") {
        return TokenType.constantCharacter;
      }
      return TokenType.constantNumber;
    }

    case TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel: {
      const rawToken = fileContents.slice(startIndex, lastIndex + 1);
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
