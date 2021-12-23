import TokenCategory from './TokenCategory';
import tokenValueToTypeMap from './tokenMaps';
import TokenType from './TokenType';

export default function tokenDetermineType(
  fileContents: string,
  startIndex: number,
  lastIndex: number,
  category: TokenCategory,
): TokenType {
  const rawToken = fileContents.slice(startIndex, lastIndex + 1);

  switch (category) {
    case TokenCategory.special: {
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw new Error('unknown special token');
      }
      return type;
    }

    case TokenCategory.prepro: {
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw new Error('unknown preprocessor token');
      }
      return type;
    }

    case TokenCategory.preproOrOperator: {
      if (fileContents.charAt(startIndex) === '<') {
        return TokenType.preproStandardHeader;
      }
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw new Error('unknown operator token');
      }
      return type;
    }

    case TokenCategory.commentOrOperator: {
      const type = tokenValueToTypeMap.get(rawToken);
      if (type !== undefined) {
        return type;
      }
      // We have a comment
      const commentStart = rawToken.slice(0, 2);
      if (commentStart === '//') {
        return TokenType.commentSingleLine;
      }
      return TokenType.commentMultiLine;
    }

    case TokenCategory.operator: {
      const type = tokenValueToTypeMap.get(rawToken);
      if (type === undefined) {
        throw new Error('unknown operator token');
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
