import indexOfUnescaped from '../utility/indexOfUnescaped';
import TokenCategory from './TokenCategory';
import TokenType from './TokenType';

// TODO: implement
export function tokenFindLastIndex(
  fileContents: string,
  startIndex: number,
  category: TokenCategory,
  prevTokenType: TokenType | null,
): number {
  switch (category) {
    case TokenCategory.special:
      return startIndex;

    case TokenCategory.prepro: {
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
        // We are dealing with a standard header: e.g. <stdio.h>
        const closingChevronIndex = fileContents.indexOf('>', startIndex + 1);
        return closingChevronIndex === -1
          ? fileContents.length - 1
          : closingChevronIndex;
      }
      // We are dealing with one of the following operators:
      // < <= << <<=
      const secondIndex = startIndex + 1;
      const secondChar = fileContents.charAt(secondIndex);
      if (secondChar === '=') {
        return secondIndex;
      }
      if (secondChar === '<') {
        const thirdIndex = startIndex + 2;
        const thirdChar = fileContents.charAt(thirdIndex);
        if (thirdChar === '=') {
          return thirdIndex;
        }
        return secondIndex;
      }
      return startIndex;
    }

    case TokenCategory.operator: {
      const firstChar = fileContents.charAt(startIndex);
      if (firstChar.match(/[.?:~]/)) {
        return startIndex;
      }

      switch (firstChar) {
        case '+': {
          const secondIndex = startIndex + 1;
          const secondChar = fileContents.charAt(secondIndex);
          if (secondChar.match(/[+=]/) !== null) {
            return secondIndex;
          }
          return startIndex;
        }
        case '-': {
          const secondChar = fileContents.charAt(startIndex + 1);
          if (secondChar.match(/[\-=>]/)) {
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
          const secondIndex = startIndex + 1;
          const secondChar = fileContents.charAt(secondIndex);
          return secondChar === '=' ? secondIndex : startIndex;
        }
        case '>': {
          const secondIndex = startIndex + 1;
          const secondChar = fileContents.charAt(secondIndex);
          if (secondChar === '=') {
            return secondIndex;
          }
          if (secondChar === firstChar) {
            // We have >> or <<
            const thirdIndex = startIndex + 2;
            const thirdChar = fileContents.charAt(thirdIndex);
            if (thirdChar === '=') {
              return thirdIndex;
            }
            return secondIndex;
          }
          return startIndex;
        }
        case '&': /* falls through */
        case '|': {
          const secondIndex = startIndex + 1;
          const secondChar = fileContents.charAt(secondIndex);
          if (secondChar === firstChar || secondChar === '=') {
            return secondIndex;
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
      if (['"', "'"].includes(firstChar)) {
        // We are dealing with a character or string constant
        const closingCharIndex = indexOfUnescaped(
          fileContents,
          firstChar,
          startIndex + 1,
        );
        return closingCharIndex === -1
          ? fileContents.length - 1
          : closingCharIndex;
      }
      // We are dealing with a numeric constant
      let i: number;
      for (i = startIndex + 1; i < fileContents.length; ++i) {
        const char = fileContents.charAt(i);
        const isAlphanumericChar = char.match(/[0-9a-zA-Z]/);
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
        if (char.match(/[a-zA-Z0-9_]/)) {
          continue;
        }
        if (char === ':') {
          // Label
          return i;
        }
        return i - 1;
      }
      return fileContents.length - 1;
    }
  }
}
