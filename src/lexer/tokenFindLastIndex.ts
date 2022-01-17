import indexOfUnescaped from '../utility/indexOfUnescaped';
import TokenCategory from './TokenCategory';
import TokenType from './TokenType';

const multiLineCommentRegex = /\*/,
  singleCharOperatorRegex = /[?:~]/,
  // singleCharOperatorRegex = /[.?:~]/,
  plusPlusOrPlusEqualRegex = /[+=]/,
  minusMinusOrMinusEqualOrArrowRegex = /[\-=>]/,
  singleOrDoubleQuoteRegex = /["']/,
  alphanumericRegex = /[0-9a-zA-Z]/,
  alphanumericOrUnderscoreRegex = /[a-zA-Z0-9_]/;

export default function tokenFindLastIndex(
  fileContents: string,
  startIndex: number,
  category: TokenCategory,
  prevTokenType: TokenType | null,
): number {
  switch (category) {
    case TokenCategory.newline:
    case TokenCategory.special:
      return startIndex;

    case TokenCategory.prepro: {
      if (fileContents.charAt(startIndex) === '\\') {
        // We have a line continuation
        return startIndex;
      }
      const searchStartIndex = startIndex + 1;
      const firstSpaceIndex = fileContents.indexOf(' ', searchStartIndex);
      if (firstSpaceIndex === searchStartIndex) {
        throw new Error('null preprocessor directives are not supported');
      }
      if (firstSpaceIndex === -1) {
        const lastFileIndex = fileContents.length - 1;
        if (lastFileIndex === startIndex) {
          throw new Error('null preprocessor directives are not supported');
        }
        return lastFileIndex;
      }
      return firstSpaceIndex - 1;
    }

    case TokenCategory.preproOrOperator: {
      if (prevTokenType === TokenType.preproDirectiveInclude) {
        // We have a standard header: e.g. <stdio.h>
        const closingChevronIndex = fileContents.indexOf('>', startIndex + 1);
        return closingChevronIndex === -1
          ? fileContents.length - 1
          : closingChevronIndex;
      }
      // We have < or <= or << or <<=
      const secondCharIndex = startIndex + 1;
      const secondChar = fileContents.charAt(secondCharIndex);
      if (secondChar === '=') {
        // We have <=
        return secondCharIndex;
      }
      if (secondChar === '<') {
        // We have << or <<=
        const thirdIndex = startIndex + 2;
        const thirdChar = fileContents.charAt(thirdIndex);
        if (thirdChar === '=') {
          // We have <<=
          return thirdIndex;
        }
        return secondCharIndex;
      }
      return startIndex;
    }

    case TokenCategory.commentOrOperator: {
      const secondCharIndex = startIndex + 1;
      const secondChar = fileContents.charAt(secondCharIndex);
      if (secondChar === '=') {
        // We have /=
        return secondCharIndex;
      }
      if (secondChar.match('/')) {
        // We have a single line comment
        const firstNewlineCharIndex = fileContents.indexOf(
          '\n',
          startIndex + 2,
        );
        return firstNewlineCharIndex === -1
          ? fileContents.length - 1
          : firstNewlineCharIndex - 1;
      }
      if (secondChar.match(multiLineCommentRegex)) {
        // We have a multi line comment
        const closingSequenceStartIndex = fileContents.indexOf(
          '*/',
          startIndex + 2,
        );
        return closingSequenceStartIndex === -1
          ? fileContents.length - 1
          : closingSequenceStartIndex + 1;
      }
      return startIndex;
    }

    case TokenCategory.operator: {
      const firstChar = fileContents.charAt(startIndex);
      if (firstChar.match(singleCharOperatorRegex)) {
        // We have a single char operator
        return startIndex;
      }

      switch (firstChar) {
        case '+': {
          const secondCharIndex = startIndex + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          if (secondChar.match(plusPlusOrPlusEqualRegex)) {
            // We have ++ or +=
            return secondCharIndex;
          }
          return startIndex;
        }

        case '-': {
          const secondChar = fileContents.charAt(startIndex + 1);
          if (secondChar.match(minusMinusOrMinusEqualOrArrowRegex)) {
            // We have -- or -= or ->
            return startIndex + 1;
          }
          return startIndex;
        }

        case '/': /* falls through */
        case '*': /* falls through */
        case '%': /* falls through */
        case '=': /* falls through */
        case '!': /* falls through */
        case '^': {
          const secondCharIndex = startIndex + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          return secondChar === '=' ? secondCharIndex : startIndex;
        }

        case '>': {
          const secondCharIndex = startIndex + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          if (secondChar === '=') {
            // We have >=
            return secondCharIndex;
          }
          if (secondChar === firstChar) {
            // We have >> or <<
            const thirdIndex = startIndex + 2;
            const thirdChar = fileContents.charAt(thirdIndex);
            if (thirdChar === '=') {
              // We have >>= or <<=
              return thirdIndex;
            }
            return secondCharIndex;
          }
          return startIndex;
        }

        case '&': /* falls through */
        case '|': {
          const secondCharIndex = startIndex + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          if (secondChar === firstChar || secondChar === '=') {
            // We have && or &= or || or |=
            return secondCharIndex;
          }
          return startIndex;
        }

        case '.': {
          const firstThreeChars = fileContents.slice(startIndex, startIndex + 3);
          if (firstThreeChars === '...') {
            return startIndex + 2;
          }
          return startIndex;
        }
      }

      throw new Error(
        `failed to find last index of operator token starting at position ${startIndex}`,
      );
    }

    case TokenCategory.constant: {
      const firstChar = fileContents.charAt(startIndex);
      if (firstChar.match(singleOrDoubleQuoteRegex)) {
        // We have a string or char constant
        const closingCharIndex = indexOfUnescaped(
          fileContents,
          firstChar,
          startIndex + 1,
        );
        return closingCharIndex === -1
          ? fileContents.length - 1
          : closingCharIndex;
      }
      // We have a numeric constant
      let i: number;
      for (i = startIndex + 1; i < fileContents.length; ++i) {
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
      for (let i = startIndex; i < fileContents.length; ++i) {
        const char = fileContents.charAt(i);
        if (char.match(alphanumericOrUnderscoreRegex)) {
          continue;
        }
        if (char === ':') {
          // We have a label
          return i;
        }
        return i - 1;
      }
      return fileContents.length - 1;
    }
  }
}
