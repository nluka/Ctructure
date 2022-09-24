import indexOfUnescaped from '../utility/indexOfUnescaped';
import TokenCategory, { tokenCategoryToStringMap } from './TokenCategory';
import tokenDetermineLineAndNum from './tokenDetermineLineAndNum';

const singleCharOperatorRegex = /^[?:~]$/,
  plusPlusOrPlusEqualRegex = /^[+=]$/,
  minusMinusOrMinusEqualOrArrowRegex = /^[\-=>]$/,
  alphanumericRegex = /^[a-zA-Z0-9]$/,
  alphanumericOrUnderscoreRegex = /^[a-zA-Z0-9_]$/;

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

    case TokenCategory.preproDirective: {
      const firstUnescapedNewlinePos = indexOfUnescaped(
        fileContents,
        '\n',
        '\\',
        tokStartPos + 1,
      );
      const token = fileContents.slice(tokStartPos, firstUnescapedNewlinePos);
      if (token.includes('/*')) {
        throw new Error(
          `unsupported syntax (US1) on line ${
            tokenDetermineLineAndNum(fileContents, tokStartPos + 1).lineNum
          } - multiline comment opening in preprocessor directive (https://github.com/nluka/Ctructure#us1-multiline-comment-opening-in-preprocessor-directive)`,
        );
      }
      return firstUnescapedNewlinePos === -1
        ? fileContents.length - 1
        : firstUnescapedNewlinePos - 1;
    }

    case TokenCategory.commentOrOperator: {
      const secondCharPos = tokStartPos + 1;
      const secondChar = fileContents.charAt(secondCharPos);

      switch (secondChar) {
        case '=':
          return secondCharPos; // /=
        case '/': {
          // single line comment
          const firstNewlineCharIndex = fileContents.indexOf(
            '\n',
            tokStartPos + 2,
          );
          return firstNewlineCharIndex === -1
            ? fileContents.length - 1
            : firstNewlineCharIndex - 1;
        }
        case '*': {
          // multi line comment
          const closingSequenceStartPos = fileContents.indexOf(
            '*/',
            tokStartPos + 2,
          );
          return closingSequenceStartPos === -1
            ? fileContents.length - 1
            : closingSequenceStartPos + 1;
        }
        default:
          return tokStartPos;
      }
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
          } else {
            return tokStartPos;
          }
        }

        case '-': {
          const secondChar = fileContents.charAt(tokStartPos + 1);
          if (secondChar.match(minusMinusOrMinusEqualOrArrowRegex)) {
            // -- -= ->
            return tokStartPos + 1;
          } else {
            return tokStartPos;
          }
        }

        case '*':
        case '%':
        case '=':
        case '!':
        case '^': {
          const secondCharIndex = tokStartPos + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          return secondChar === '=' ? secondCharIndex : tokStartPos;
        }

        case '<':
        case '>': {
          const secondCharPos = tokStartPos + 1;
          const secondChar = fileContents.charAt(secondCharPos);
          if (secondChar === '=') {
            // >=
            return secondCharPos;
          } else if (secondChar === firstChar) {
            // >> <<
            const thirdCharPos = tokStartPos + 2;
            const thirdChar = fileContents.charAt(thirdCharPos);
            if (thirdChar === '=') {
              // >>= <<=
              return thirdCharPos;
            } else {
              return secondCharPos;
            }
          } else {
            return tokStartPos;
          }
        }

        case '&':
        case '|': {
          const secondCharIndex = tokStartPos + 1;
          const secondChar = fileContents.charAt(secondCharIndex);
          if (secondChar === firstChar || secondChar === '=') {
            // && &= || |=
            return secondCharIndex;
          } else {
            return tokStartPos;
          }
        }
      }

      const { lineNum, tokenNum } = tokenDetermineLineAndNum(
        fileContents,
        tokStartPos,
      );
      throw new Error(
        `cannot find end position of token ${tokenNum} on line ${lineNum} (category=${tokenCategoryToStringMap.get(
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
      } else {
        return findEndPositionNumericConstant(tokStartPos, fileContents);
      }
    }

    case TokenCategory.operatorOrConstant: {
      const secondChar = fileContents.charAt(tokStartPos + 1);
      if (secondChar === '.') {
        const thirdChar = fileContents.charAt(tokStartPos + 2);
        if (thirdChar === '.') {
          // ellipses
          return tokStartPos + 2;
        } else {
          // direct member selection
          return tokStartPos;
        }
      } else if (!secondChar.match(/^[0-9]/)) {
        // direct member selection
        return tokStartPos;
      } else {
        return findEndPositionNumericConstant(tokStartPos, fileContents);
      }
    }

    case TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel: {
      for (let pos = tokStartPos + 1; pos < fileContents.length; ++pos) {
        const char = fileContents.charAt(pos);
        if (!char.match(alphanumericOrUnderscoreRegex)) {
          return pos - 1;
        }
      }
      return fileContents.length - 1;
    }
  }
}

export function findEndPositionNumericConstant(
  tokStartPos: number,
  fileContents: string,
): number {
  let hasExponentSignBeenSeen = false;
  for (let pos = tokStartPos + 1; pos < fileContents.length; ++pos) {
    const char = fileContents.charAt(pos);
    if (char === '+' || char === '-') {
      if (hasExponentSignBeenSeen) {
        return pos - 1;
      }
      const prevChar = fileContents.charAt(pos - 1);
      if (prevChar === 'e' || prevChar === 'E') {
        hasExponentSignBeenSeen = true;
        continue;
      } else {
        return pos - 1;
      }
    } else if (!char.match(alphanumericRegex) && char !== '.') {
      return pos - 1;
    }
  }
  return fileContents.length - 1;
}
