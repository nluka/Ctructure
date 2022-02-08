import indexOfUnescaped from '../utility/indexOfUnescaped';
import TokenCategory, { tokenCategoryToStringMap } from './TokenCategory';
import tokenDetermineLineAndNum from './tokenDetermineLineAndNum';

const singleCharOperatorRegex = /[?:~]/,
  plusPlusOrPlusEqualRegex = /[+=]/,
  minusMinusOrMinusEqualOrArrowRegex = /[\-=>]/,
  alphanumericRegex = /[0-9a-zA-Z]/,
  alphanumericOrUnderscoreRegex = /[a-zA-Z0-9_]/;

/**
 * Finds the index of the last character of a token based on its category.
 * @param fileContents The contents of the file.
 * @param tokStartPos The index of the token's first character in `fileContents`.
 * @param tokCategory The category of the token.
 * @returns The index of the last character of the token.
 */
export default function tokenFindEndPosition(
  fileContents: string,
  tokStartPos: number,
  tokCategory: TokenCategory,
): number {
  switch (tokCategory) {
    case TokenCategory.newline:
    case TokenCategory.special: {
      return tokStartPos;
    }

    case TokenCategory.preproHash: {
      const firstUnescapedNewlineIndex = indexOfUnescaped(
        fileContents,
        '\n',
        '\\',
        tokStartPos + 1,
      );
      if (firstUnescapedNewlineIndex === -1) {
        return fileContents.length - 1;
      }
      return firstUnescapedNewlineIndex - 1;
    }

    case TokenCategory.commentOrOperator: {
      const secondCharIndex = tokStartPos + 1;
      const secondChar = fileContents.charAt(secondCharIndex);

      if (secondChar === '=') {
        // /=
        return secondCharIndex;
      }

      if (secondChar === '/') {
        // Single line comment
        const firstNewlineCharIndex = fileContents.indexOf(
          '\n',
          tokStartPos + 2,
        );
        return firstNewlineCharIndex === -1
          ? fileContents.length - 1
          : firstNewlineCharIndex - 1;
      }

      if (secondChar === '*') {
        // Multi line comment
        const closingSequenceStartPos = fileContents.indexOf(
          '*/',
          tokStartPos + 2,
        );
        return closingSequenceStartPos === -1
          ? fileContents.length - 1
          : closingSequenceStartPos + 1;
      }

      return tokStartPos;
    }

    case TokenCategory.operator: {
      const firstChar = fileContents.charAt(tokStartPos);

      if (firstChar.match(singleCharOperatorRegex)) {
        return tokStartPos;
      }

      switch (firstChar) {
        case '+': {
          const secondCharIndex = tokStartPos + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          if (secondChar.match(plusPlusOrPlusEqualRegex)) {
            // ++ +=
            return secondCharIndex;
          }
          return tokStartPos;
        }

        case '-': {
          const secondChar = fileContents.charAt(tokStartPos + 1);
          if (secondChar.match(minusMinusOrMinusEqualOrArrowRegex)) {
            // -- -= ->
            return tokStartPos + 1;
          }
          return tokStartPos;
        }

        case '*': /* falls through */
        case '%': /* falls through */
        case '=': /* falls through */
        case '!': /* falls through */
        case '^': {
          const secondCharIndex = tokStartPos + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          return secondChar === '=' ? secondCharIndex : tokStartPos;
        }

        case '<': /* falls through */
        case '>': {
          const secondCharIndex = tokStartPos + 1;
          const secondChar = fileContents.charAt(secondCharIndex);

          if (secondChar === '=') {
            // >=
            return secondCharIndex;
          }

          if (secondChar === firstChar) {
            // >> <<
            const thirdIndex = tokStartPos + 2;
            const thirdChar = fileContents.charAt(thirdIndex);
            if (thirdChar === '=') {
              // >>= <<=
              return thirdIndex;
            }
            return secondCharIndex;
          }

          return tokStartPos;
        }

        case '&': /* falls through */
        case '|': {
          const secondCharIndex = tokStartPos + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          if (secondChar === firstChar || secondChar === '=') {
            // && &= || |=
            return secondCharIndex;
          }
          return tokStartPos;
        }

        case '.': {
          const firstThreeChars = fileContents.slice(
            tokStartPos,
            tokStartPos + 3,
          );
          return firstThreeChars === '...' ? tokStartPos + 2 : tokStartPos;
        }
      }

      const { lineNum, tokenNum } = tokenDetermineLineAndNum(
        fileContents,
        tokStartPos,
      );
      throw new Error(
        `unable to find last index of token ${tokenNum} on line ${lineNum} (category=${tokenCategoryToStringMap.get(
          tokCategory,
        )})`,
      );
    }

    case TokenCategory.constant: {
      const firstChar = fileContents.charAt(tokStartPos);

      if (firstChar === `'` || firstChar === `"`) {
        // String or character constant
        const closingCharIndex = indexOfUnescaped(
          fileContents,
          firstChar,
          '\\',
          tokStartPos + 1,
        );
        return closingCharIndex === -1
          ? fileContents.length - 1
          : closingCharIndex;
      }

      // Numeric constant
      let i: number;
      for (i = tokStartPos + 1; i < fileContents.length; ++i) {
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

    case TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel: {
      for (let i = tokStartPos; i < fileContents.length; ++i) {
        const char = fileContents.charAt(i);
        if (!char.match(alphanumericOrUnderscoreRegex)) {
          return i - 1;
        }
      }
      return fileContents.length - 1;
    }
  }
}
