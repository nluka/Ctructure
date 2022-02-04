import indexOfUnescaped from '../utility/indexOfUnescaped';
import TokenCategory, { tokenCategoryToStringMap } from './TokenCategory';
import tokenDetermineLineAndPos from './tokenDetermineLineAndPos';

const singleCharOperatorRegex = /[?:~]/,
  plusPlusOrPlusEqualRegex = /[+=]/,
  minusMinusOrMinusEqualOrArrowRegex = /[\-=>]/,
  alphanumericRegex = /[0-9a-zA-Z]/,
  alphanumericOrUnderscoreRegex = /[a-zA-Z0-9_]/;

/**
 * Finds the index of the last character of a token based on its category.
 * @param fileContents The contents of the file.
 * @param tokenStartIndex The index of the token's first character.
 * @param tokenCategory The category of the token.
 * @returns The index of the last character of the token.
 */
export default function tokenFindLastIndex(
  fileContents: string,
  tokenStartIndex: number,
  tokenCategory: TokenCategory,
): number {
  switch (tokenCategory) {
    case TokenCategory.newline:
    case TokenCategory.special: {
      return tokenStartIndex;
    }

    case TokenCategory.preproHash: {
      const firstUnescapedNewlineIndex = indexOfUnescaped(
        fileContents,
        '\n',
        '\\',
        tokenStartIndex + 1,
      );
      if (firstUnescapedNewlineIndex === -1) {
        return fileContents.length - 1;
      }
      return firstUnescapedNewlineIndex - 1;
    }

    case TokenCategory.commentOrOperator: {
      const secondCharIndex = tokenStartIndex + 1;
      const secondChar = fileContents.charAt(secondCharIndex);

      if (secondChar === '=') {
        // /=
        return secondCharIndex;
      }

      if (secondChar === '/') {
        // Single line comment
        const firstNewlineCharIndex = fileContents.indexOf(
          '\n',
          tokenStartIndex + 2,
        );
        return firstNewlineCharIndex === -1
          ? fileContents.length - 1
          : firstNewlineCharIndex - 1;
      }

      if (secondChar === '*') {
        // Multi line comment
        const closingSequenceStartIndex = fileContents.indexOf(
          '*/',
          tokenStartIndex + 2,
        );
        return closingSequenceStartIndex === -1
          ? fileContents.length - 1
          : closingSequenceStartIndex + 1;
      }

      return tokenStartIndex;
    }

    case TokenCategory.operator: {
      const firstChar = fileContents.charAt(tokenStartIndex);

      if (firstChar.match(singleCharOperatorRegex)) {
        return tokenStartIndex;
      }

      switch (firstChar) {
        case '+': {
          const secondCharIndex = tokenStartIndex + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          if (secondChar.match(plusPlusOrPlusEqualRegex)) {
            // ++ +=
            return secondCharIndex;
          }
          return tokenStartIndex;
        }

        case '-': {
          const secondChar = fileContents.charAt(tokenStartIndex + 1);
          if (secondChar.match(minusMinusOrMinusEqualOrArrowRegex)) {
            // -- -= ->
            return tokenStartIndex + 1;
          }
          return tokenStartIndex;
        }

        case '*': /* falls through */
        case '%': /* falls through */
        case '=': /* falls through */
        case '!': /* falls through */
        case '^': {
          const secondCharIndex = tokenStartIndex + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          return secondChar === '=' ? secondCharIndex : tokenStartIndex;
        }

        case '<': /* falls through */
        case '>': {
          const secondCharIndex = tokenStartIndex + 1;
          const secondChar = fileContents.charAt(secondCharIndex);

          if (secondChar === '=') {
            // >=
            return secondCharIndex;
          }

          if (secondChar === firstChar) {
            // >> <<
            const thirdIndex = tokenStartIndex + 2;
            const thirdChar = fileContents.charAt(thirdIndex);
            if (thirdChar === '=') {
              // >>= <<=
              return thirdIndex;
            }
            return secondCharIndex;
          }

          return tokenStartIndex;
        }

        case '&': /* falls through */
        case '|': {
          const secondCharIndex = tokenStartIndex + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          if (secondChar === firstChar || secondChar === '=') {
            // && &= || |=
            return secondCharIndex;
          }
          return tokenStartIndex;
        }

        case '.': {
          const firstThreeChars = fileContents.slice(
            tokenStartIndex,
            tokenStartIndex + 3,
          );
          return firstThreeChars === '...'
            ? tokenStartIndex + 2
            : tokenStartIndex;
        }
      }

      const { lineNum, tokenNum } = tokenDetermineLineAndPos(
        fileContents,
        tokenStartIndex,
      );
      throw new Error(
        `unable to find last index of token at line ${lineNum} tokenNum ${tokenNum} (category : ${tokenCategoryToStringMap.get(
          tokenCategory,
        )})`,
      );
    }

    case TokenCategory.constant: {
      const firstChar = fileContents.charAt(tokenStartIndex);

      if (firstChar === `'` || firstChar === `"`) {
        // String or character constant
        const closingCharIndex = indexOfUnescaped(
          fileContents,
          firstChar,
          '\\',
          tokenStartIndex + 1,
        );
        return closingCharIndex === -1
          ? fileContents.length - 1
          : closingCharIndex;
      }

      {
        // Numeric constant
        let i: number;
        for (i = tokenStartIndex + 1; i < fileContents.length; ++i) {
          const char = fileContents.charAt(i);
          const isAlphanumericChar = char.match(alphanumericRegex);
          if (isAlphanumericChar || char === '.') {
            continue;
          }
          if (char !== '-') {
            break;
          }
          const prevChar = fileContents.charAt(i - 1).toLowerCase();
          if (prevChar !== 'e') {
            break;
          }
        }
        return i - 1;
      }
    }

    case TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel: {
      for (let i = tokenStartIndex; i < fileContents.length; ++i) {
        const char = fileContents.charAt(i);
        if (!char.match(alphanumericOrUnderscoreRegex)) {
          return i - 1;
        }
      }
      return fileContents.length - 1;
    }
  }
}
