import indexOfRegex from '../utility/indexOfRegex';
import indexOfUnescaped from '../utility/indexOfUnescaped';
import TokenCategory, { tokenCategoryToStringMap } from './TokenCategory';
import tokenDetermineLineAndIndex from './tokenDetermineLineAndIndex';
import TokenType from './TokenType';

const multiLineCommentRegex = /\*/,
  singleCharOperatorRegex = /[?:~]/,
  plusPlusOrPlusEqualRegex = /[+=]/,
  minusMinusOrMinusEqualOrArrowRegex = /[\-=>]/,
  singleOrDoubleQuoteRegex = /["']/,
  alphanumericRegex = /[0-9a-zA-Z]/,
  alphanumericOrUnderscoreRegex = /[a-zA-Z0-9_]/,
  spaceOrTabOrNewlineRegex = /[ \t\n]/;

export default function tokenFindLastIndex(
  fileContents: string,
  tokenStartIndex: number,
  tokenCategory: TokenCategory,
  prevTokenType: TokenType | null,
): number {
  switch (tokenCategory) {
    case TokenCategory.newline:
    case TokenCategory.special:
      return tokenStartIndex;

    case TokenCategory.prepro: {
      if (fileContents.charAt(tokenStartIndex) === '\\') {
        // We have a line continuation
        return tokenStartIndex;
      }
      if (fileContents.charAt(tokenStartIndex + 1) === '#') {
        // We have concat operator
        return tokenStartIndex + 1;
      }
      const searchStartIndex = tokenStartIndex + 1;
      const firstTerminatorIndex = indexOfRegex(
        fileContents,
        spaceOrTabOrNewlineRegex,
        searchStartIndex,
      );
      if (firstTerminatorIndex === null) {
        throw createErrorStandard(fileContents, tokenStartIndex, tokenCategory);
      }
      if (firstTerminatorIndex === searchStartIndex) {
        throw createErrorNullPreproDirective(
          fileContents,
          tokenStartIndex,
          tokenCategory,
        );
      }
      if (firstTerminatorIndex === -1) {
        const lastFileIndex = fileContents.length - 1;
        if (lastFileIndex === tokenStartIndex) {
          throw createErrorNullPreproDirective(
            fileContents,
            tokenStartIndex,
            tokenCategory,
          );
        }
        return lastFileIndex;
      }
      return firstTerminatorIndex - 1;
    }

    case TokenCategory.preproOrOperator: {
      if (prevTokenType === TokenType.preproDirectiveInclude) {
        // We have a standard header: e.g. <stdio.h>
        const closingChevronIndex = fileContents.indexOf(
          '>',
          tokenStartIndex + 1,
        );
        return closingChevronIndex === -1
          ? fileContents.length - 1
          : closingChevronIndex;
      }
      // We have < or <= or << or <<=
      const secondCharIndex = tokenStartIndex + 1;
      const secondChar = fileContents.charAt(secondCharIndex);
      if (secondChar === '=') {
        // We have <=
        return secondCharIndex;
      }
      if (secondChar === '<') {
        // We have << or <<=
        const thirdIndex = tokenStartIndex + 2;
        const thirdChar = fileContents.charAt(thirdIndex);
        if (thirdChar === '=') {
          // We have <<=
          return thirdIndex;
        }
        return secondCharIndex;
      }
      return tokenStartIndex;
    }

    case TokenCategory.commentOrOperator: {
      const secondCharIndex = tokenStartIndex + 1;
      const secondChar = fileContents.charAt(secondCharIndex);
      if (secondChar === '=') {
        // We have /=
        return secondCharIndex;
      }
      if (secondChar.match('/')) {
        // We have a single line comment
        const firstNewlineCharIndex = fileContents.indexOf(
          '\n',
          tokenStartIndex + 2,
        );
        return firstNewlineCharIndex === -1
          ? fileContents.length - 1
          : firstNewlineCharIndex - 1;
      }
      if (secondChar.match(multiLineCommentRegex)) {
        // We have a multi line comment
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
        // We have a single char operator
        return tokenStartIndex;
      }

      switch (firstChar) {
        case '+': {
          const secondCharIndex = tokenStartIndex + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          if (secondChar.match(plusPlusOrPlusEqualRegex)) {
            // We have ++ or +=
            return secondCharIndex;
          }
          return tokenStartIndex;
        }

        case '-': {
          const secondChar = fileContents.charAt(tokenStartIndex + 1);
          if (secondChar.match(minusMinusOrMinusEqualOrArrowRegex)) {
            // We have -- or -= or ->
            return tokenStartIndex + 1;
          }
          return tokenStartIndex;
        }

        case '/': /* falls through */
        case '*': /* falls through */
        case '%': /* falls through */
        case '=': /* falls through */
        case '!': /* falls through */
        case '^': {
          const secondCharIndex = tokenStartIndex + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          return secondChar === '=' ? secondCharIndex : tokenStartIndex;
        }

        case '>': {
          const secondCharIndex = tokenStartIndex + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          if (secondChar === '=') {
            // We have >=
            return secondCharIndex;
          }
          if (secondChar === firstChar) {
            // We have >> or <<
            const thirdIndex = tokenStartIndex + 2;
            const thirdChar = fileContents.charAt(thirdIndex);
            if (thirdChar === '=') {
              // We have >>= or <<=
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
            // We have && or &= or || or |=
            return secondCharIndex;
          }
          return tokenStartIndex;
        }

        case '.': {
          const firstThreeChars = fileContents.slice(
            tokenStartIndex,
            tokenStartIndex + 3,
          );
          if (firstThreeChars === '...') {
            return tokenStartIndex + 2;
          }
          return tokenStartIndex;
        }
      }

      const { lineNum, indexOnLine } = tokenDetermineLineAndIndex(
        fileContents,
        tokenStartIndex,
      );
      throw new Error(
        `unable to find last index of token at line ${lineNum} indexOnLine ${indexOnLine} (startIndex = ${tokenStartIndex}, category = ${tokenCategoryToStringMap.get(
          tokenCategory,
        )})`,
      );
    }

    case TokenCategory.constant: {
      const firstChar = fileContents.charAt(tokenStartIndex);
      if (firstChar.match(singleOrDoubleQuoteRegex)) {
        // We have a string or char constant
        const closingCharIndex = indexOfUnescaped(
          fileContents,
          firstChar,
          tokenStartIndex + 1,
        );
        return closingCharIndex === -1
          ? fileContents.length - 1
          : closingCharIndex;
      }
      // We have a numeric constant
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

    case TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel: {
      for (let i = tokenStartIndex; i < fileContents.length; ++i) {
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

function createErrorStandard(
  fileContents: string,
  tokenStartIndex: number,
  tokenCategory: TokenCategory,
) {
  const { lineNum, indexOnLine } = tokenDetermineLineAndIndex(
    fileContents,
    tokenStartIndex,
  );
  return new Error(
    `unable to find last index of token at line ${lineNum} indexOnLine ${indexOnLine} (startIndex = ${tokenStartIndex}, category = ${tokenCategoryToStringMap.get(
      tokenCategory,
    )})`,
  );
}

function createErrorNullPreproDirective(
  fileContents: string,
  tokenStartIndex: number,
  tokenCategory: TokenCategory,
) {
  const { lineNum, indexOnLine } = tokenDetermineLineAndIndex(
    fileContents,
    tokenStartIndex,
  );
  return new Error(
    `null preprocessor directives are not supported - found at line ${lineNum} indexOnLine ${indexOnLine} (startIndex = ${tokenStartIndex}, category = ${tokenCategoryToStringMap.get(
      tokenCategory,
    )})`,
  );
}
