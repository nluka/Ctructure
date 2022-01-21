import TokenArray from '../lexer/TokenArray';
import tokenDecode from '../lexer/tokenDecode';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import tokenFindLastIndex from '../lexer/tokenFindLastIndex';
import TokenType from '../lexer/TokenType';
import areThereCommas from './areThereCommas';
import checkForLineOverflow from './checkForLineOverflow';
import getNextNonNewlineTokenType from './getNextNonNewlineTokenType';
import getPrevNonNewlineTokenType from './getPrevNonNewlineTokenType';
import PrinterCategory from './PrinterCategory';
import Stack from './Stack';
import tokenTypeToValueMap from './tokenTypeToValueMap';

export type ContextTypes = TokenType | PrinterCategory | null;

export default function printer(
  fileContents: string,
  tokenArray: TokenArray,
  spaceAmount: number,
): string {
  const indentation = ' '.repeat(spaceAmount);
  const tokens: Uint32Array = tokenArray.getValues();

  // If true (due to line overflow), the line will split where it's appropriate.
  let overflow: boolean = false;

  // When true, a new line will be added after the current token
  let newline: boolean = false;

  // When true, no extra new lines for are allowed
  let noExtraNewline: boolean = false;

  // Current indentation level
  let blockLevel: number = 0;

  // Depth of parenthesis
  let parenCount = 0;

  // Used to alter the current string before adding to the final string
  let currString: string = '';

  // Does not include newlines
  let nextTokenType: ContextTypes;

  // Previous token's type
  let previousType: ContextTypes = null;

  // Determines how a token should behave
  let context: ContextTypes = null;

  // Used to store context when opening parentheses/braces/brackets are present
  let contextStack: Stack = new Stack();

  // Holds the popped context from contextStack
  let previousContext: {
    context: ContextTypes;
    overflow: boolean;
    blockLevel: number;
  } | null = null;

  // Used in determining if there is line overflow
  let startLineIndex: number = tokenDecode(tokens[0])[0];

  // Final string to be printed
  let formattedFileStr: string = '';

  function isThereLineOverflow(i: number, overflowType: ContextTypes): boolean {
    overflow = checkForLineOverflow(fileContents, overflowType, tokens, i, startLineIndex);
    return overflow;
  }

  function extractStringFromFile(startIndex: number, prevTokenType: TokenType | null): string {
    return fileContents.slice(
      startIndex,
      tokenFindLastIndex(
        fileContents,
        startIndex,
        tokenDetermineCategory(fileContents, startIndex),
        prevTokenType,
      ) + 1,
    );
  }

  for (
    let i = 0;
    i < tokenArray.getCount();
    ++i, nextTokenType = getNextNonNewlineTokenType(tokens, i)
  ) {
    const [currTokenStartIndex, currTokenType] = tokenDecode(tokens[i]);
    const typeAsValue = tokenTypeToValueMap.get(currTokenType);

    currString += typeAsValue;
    if (newline && currTokenType !== TokenType.commentSingleline) {
      if (
        currTokenType === TokenType.newline &&
        tokenDecode(tokens[i + 1])[1] === TokenType.newline &&
        !noExtraNewline
      ) {
        currString = '\n\n' + indentation.repeat(blockLevel) + currString;
      } else {
        currString = '\n' + indentation.repeat(blockLevel) + currString;
      }
      noExtraNewline = false;
      newline = false;
      startLineIndex = currTokenStartIndex - blockLevel * spaceAmount;
    }

    switch (currTokenType) {
      case TokenType.newline:
        if (
          context === PrinterCategory.prepro &&
          previousType !== TokenType.preproLineContinuation &&
          previousType !== TokenType.commentMultiline &&
          previousType !== TokenType.commentSingleline
        ) {
          if (tokenDecode(tokens[i + 1])[1] === TokenType.newline) {
            currString += '\n';
          }
          newline = true;
          context = null;
        }
        continue;

      case TokenType.specialComma:
        if (context === PrinterCategory.multiVariableDecl || overflow) {
          newline = true;
        } else if (
          context === PrinterCategory.variableDecl ||
          context === PrinterCategory.doubleTypeOrIdentifier
        ) {
          newline = true;
          ++blockLevel;
          context = PrinterCategory.multiVariableDecl;
        } else if (getNextNonNewlineTokenType(tokens, i) === TokenType.preproLineContinuation) {
          currString = ',';
        } else {
          currString = ', ';
        }
        break;

      case TokenType.specialSemicolon:
        if (
          context === PrinterCategory.multiVariableDecl ||
          context === PrinterCategory.singleLineIf
        ) {
          --blockLevel;
          newline = true;
          context = null;
        } else if (
          context === PrinterCategory.variableDecl ||
          context === TokenType.keywordStruct ||
          context === TokenType.keywordEnum
        ) {
          newline = true;
          context = null;
        } else if (context === TokenType.keywordFor) {
          currString = '; ';
        } else {
          overflow = false;
          newline = true;
        }
        break;

      case TokenType.specialBracketOpening:
        contextStack.push({ context, overflow, blockLevel });
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.variableDecl;
        }
        if (isThereLineOverflow(i, currTokenType)) {
          ++blockLevel;
          newline = true;
        }
        break;

      case TokenType.specialBracketClosing:
        previousContext = contextStack.pop();
        blockLevel = previousContext.blockLevel;
        if (overflow) {
          currString = `\n${indentation.repeat(blockLevel) + currString}`;
        }
        context = previousContext.context;
        overflow = previousContext.overflow;
        break;

      case TokenType.specialParenthesisOpening:
        ++parenCount;
        contextStack.push({ context, overflow, blockLevel });
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.functionDecl;
        } else if (previousType === TokenType.identifier) {
          context = PrinterCategory.functionCall;
        } else if (context !== TokenType.keywordFor) {
          context = null;
        }

        if (getNextNonNewlineTokenType(tokens, i) === TokenType.specialParenthesisClosing) {
          overflow = false;
        } else if (isThereLineOverflow(i, context)) {
          newline = true;
          ++blockLevel;
        }
        break;

      case TokenType.specialParenthesisClosing:
        if (overflow) {
          currString = `\n${indentation.repeat(--blockLevel)})`;
          startLineIndex = currTokenStartIndex;
        }
        --parenCount;
        previousContext = contextStack.pop();
        overflow = previousContext.overflow;
        blockLevel = previousContext.blockLevel;
        if (previousContext.context === TokenType.keywordFor && parenCount === 0) {
          context = null;
        } else if (previousContext.context === TokenType.keywordIf) {
          if (getNextNonNewlineTokenType(tokens, i) !== TokenType.specialBraceOpening) {
            context = PrinterCategory.singleLineIf;
            ++blockLevel;
            newline = true;
            noExtraNewline = true;
          } else {
            context = null;
          }
        } else {
          context = previousContext.context;
        }
        break;

      case TokenType.specialBraceOpening:
        contextStack.push({ context, overflow, blockLevel });
        if (
          previousType === TokenType.operatorBinaryAssignmentDirect ||
          context === PrinterCategory.array
        ) {
          context = PrinterCategory.array;
          if (!isThereLineOverflow(i, context)) {
            currString += ' ';
            break;
          }
        } else {
          context = null;
          currString = ' ' + currString;
        }
        ++blockLevel;
        newline = true;
        break;

      case TokenType.specialBraceClosing:
        previousContext = contextStack.pop();
        blockLevel = previousContext.blockLevel;
        currString = `\n${indentation.repeat(blockLevel)}}`;
        if (context === PrinterCategory.array) {
          if (!overflow) {
            currString = ' }';
          }
        } else if (
          previousContext.context === TokenType.keywordStruct ||
          previousContext.context === TokenType.keywordEnum
        ) {
          if (getNextNonNewlineTokenType(tokens, i) !== TokenType.specialSemicolon) {
            currString += ' ';
          }
        } else {
          newline = true;
        }
        context = previousContext.context;
        overflow = previousContext.overflow;
        break;

      // Preprocessor (https://www.cprogramming.com/reference/preprocessor/)
      case TokenType.preproDirectiveInclude:
      case TokenType.preproDirectiveDefine:
      case TokenType.preproDirectiveUndef:
      case TokenType.preproDirectiveIfdef:
      case TokenType.preproDirectiveIfndef:
      case TokenType.preproDirectiveIf:
      case TokenType.preproDirectiveElse:
      case TokenType.preproDirectiveEndif:
      case TokenType.preproDirectivePragma:
        context = PrinterCategory.prepro;
        if (
          previousType &&
          currString === typeAsValue &&
          tokenDecode(tokens[i - 1])[1] === TokenType.newline
        ) {
          currString = '\n' + currString;
          if (tokenDecode(tokens[i - 2])[1] === TokenType.newline) {
            currString = '\n' + currString;
          }
        }
        break;

      case TokenType.preproLineContinuation:
        currString = ' \\';
        newline = true;
        break;

      // Unary operator:
      case TokenType.operatorBinaryMultiplicationOrIndirection:
        nextTokenType = getNextNonNewlineTokenType(tokens, i);
        previousType = getPrevNonNewlineTokenType(tokens, i);
        if (
          previousType === PrinterCategory.typeOrIdentifier ||
          previousType === TokenType.specialParenthesisClosing
        ) {
          currString = ' *';
        }
        if (
          nextTokenType !== TokenType.operatorBinaryMultiplicationOrIndirection &&
          nextTokenType !== TokenType.specialParenthesisClosing
        ) {
          currString += ' ';
        }
        break;

      // Binary operators
      case TokenType.operatorBinaryArithmeticAddition:
      case TokenType.operatorBinaryArithmeticSubtraction:
      case TokenType.operatorBinaryArithmeticDivision:
      case TokenType.operatorBinaryArithmeticModulo:
      case TokenType.operatorBinaryComparisonEqualTo:
      case TokenType.operatorBinaryComparisonNotEqualTo:
      case TokenType.operatorBinaryComparisonGreaterThan:
      case TokenType.operatorBinaryComparisonGreaterThanOrEqualTo:
      case TokenType.operatorBinaryComparisonLessThan:
      case TokenType.operatorBinaryComparisonLessThanOrEqualTo:
      case TokenType.operatorBinaryBitwiseAnd:
      case TokenType.operatorBinaryBitwiseOr:
      case TokenType.operatorBinaryBitwiseXor:
      case TokenType.operatorBinaryBitwiseShiftLeft:
      case TokenType.operatorBinaryBitwiseShiftRight:
      case TokenType.operatorBinaryAssignmentAddition:
      case TokenType.operatorBinaryAssignmentSubtraction:
      case TokenType.operatorBinaryAssignmentMultiplication:
      case TokenType.operatorBinaryAssignmentDivision:
      case TokenType.operatorBinaryAssignmentModulo:
      case TokenType.operatorBinaryAssignmentBitwiseShiftLeft:
      case TokenType.operatorBinaryAssignmentBitwiseShiftRight:
      case TokenType.operatorBinaryAssignmentBitwiseAnd:
      case TokenType.operatorBinaryAssignmentBitwiseOr:
      case TokenType.operatorBinaryAssignmentBitwiseXor:
      case TokenType.operatorMemberSelectionDirect:
      case TokenType.operatorMemberSelectionIndirect:
      case TokenType.ambiguousPlus:
      case TokenType.ambiguousMinus:
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        break;

      case TokenType.operatorBinaryLogicalAnd:
      case TokenType.operatorBinaryLogicalOr:
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        if (overflow) {
          newline = true;
          break;
        }
        currString += ' ';
        break;

      case TokenType.operatorBinaryAssignmentDirect:
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.variableDecl;
        } else if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        if (
          parenCount === 0 &&
          getNextNonNewlineTokenType(tokens, i) !== PrinterCategory.typeOrIdentifier &&
          getNextNonNewlineTokenType(tokens, i, 2) !== TokenType.specialParenthesisOpening &&
          !areThereCommas(tokens, i) &&
          isThereLineOverflow(i, TokenType.operatorBinaryAssignmentDirect)
        ) {
          currString = ' =\n' + indentation.repeat(blockLevel + 1);
        }
        break;

      // Miscellanous operators
      case TokenType.ambiguousColon:
        if (context === TokenType.keywordCase || context === TokenType.keywordDefault) {
          context = null;
          formattedFileStr += currString;
          previousType = currTokenType;
          currString = '\n' + indentation.repeat(blockLevel);
          startLineIndex = tokenDecode(tokens[i + 1])[0] - blockLevel * indentation.length;
          continue;
        }
        currString = ' : ';
        break;

      // Keywords (https://en.cppreference.com/w/c/keyword)
      case TokenType.keywordElse:
        context = TokenType.keywordElse;
        if (previousType === TokenType.specialBraceClosing) {
          currString = ' else';
        }
        nextTokenType = getNextNonNewlineTokenType(tokens, i);
        if (nextTokenType === TokenType.keywordIf) {
          currString += ' ';
        } else if (nextTokenType !== TokenType.specialBraceOpening) {
          context = PrinterCategory.singleLineIf;
          newline = true;
          noExtraNewline = true;
          ++blockLevel;
        }
        break;

      case TokenType.keywordBool:
      case TokenType.keywordChar:
      case TokenType.keywordDouble:
      case TokenType.keywordFloat:
      case TokenType.keywordInt:
      case TokenType.keywordLong:
      case TokenType.keywordShort:
      case TokenType.keywordVoid:
        if (context === null) {
          context = PrinterCategory.typeOrIdentifier;
        }
        nextTokenType = getNextNonNewlineTokenType(tokens, i);
        if (nextTokenType === PrinterCategory.typeOrIdentifier) {
          currString += ' ';
        } else if (nextTokenType === TokenType.specialParenthesisOpening) {
          currString += ' ';
        }
        break;

      case TokenType.keywordDo:
      case TokenType.keywordFor:
      case TokenType.keywordIf:
      case TokenType.keywordStruct:
      case TokenType.keywordSwitch:
      case TokenType.keywordUnion:
        if (parenCount === 0) {
          context = currTokenType;
        }
        if (previousType === TokenType.specialParenthesisClosing) {
          currString = ' ' + currString;
        }
        break;

      case TokenType.keywordCase:
      case TokenType.keywordDefault:
        context = currTokenType;
        previousContext = contextStack.peek();
        currString = `\n${
          indentation.repeat(previousContext.blockLevel + 1) +
          tokenTypeToValueMap.get(currTokenType)
        }`;
        blockLevel = previousContext.blockLevel + 2;
        break;

      case TokenType.keywordReturn:
        if (getNextNonNewlineTokenType(tokens, i) !== TokenType.specialSemicolon) {
          currString += ' ';
        }
        break;

      case TokenType.keywordWhile:
        if (context === TokenType.keywordDo) {
          currString = ' while ';
          context = null;
        }
        break;

      case TokenType.keywordEnum:
        if (parenCount === 0) {
          context = TokenType.keywordEnum;
          overflow = true;
        }
        break;

      // Other
      case TokenType.label:
        const extractedLabel = extractStringFromFile(currTokenStartIndex, previousType);
        if (
          contextStack.peek().context === TokenType.keywordSwitch &&
          extractedLabel === 'default:'
        ) {
          currString =
            '\n' + indentation.repeat(contextStack.peek().blockLevel + 1) + extractedLabel;
        } else {
          currString += extractedLabel;
        }
        newline = true;
        noExtraNewline = true;
        break;

      case TokenType.constantString:
        currString += extractStringFromFile(currTokenStartIndex, previousType);
        if (context === PrinterCategory.prepro) {
          newline = true;
          context = null;
          break;
        }
        nextTokenType = getNextNonNewlineTokenType(tokens, i);
        if (nextTokenType === PrinterCategory.typeOrIdentifier) {
          currString += ' ';
        }
        break;

      case TokenType.constantNumber:
      case TokenType.constantCharacter:
      case TokenType.preproStandardHeader:
        currString += extractStringFromFile(currTokenStartIndex, previousType);
        break;

      case TokenType.commentSingleline:
        if (
          previousType &&
          (tokenDecode(tokens[i - 1])[1] !== TokenType.newline || currString === '')
        ) {
          currString = ' ';
        }
        currString += extractStringFromFile(currTokenStartIndex, previousType);
        if (tokenDecode(tokens[i + 1])[1] === TokenType.newline) {
          newline = true;
        }
        nextTokenType = getNextNonNewlineTokenType(tokens, i);
        if (
          nextTokenType === TokenType.specialBraceClosing ||
          nextTokenType === TokenType.keywordCase ||
          nextTokenType === TokenType.keywordDefault
        ) {
          --blockLevel;
        }
        break;

      case TokenType.commentMultiline:
        if (currString === '') {
          currString = ' ';
        }
        currString += extractStringFromFile(currTokenStartIndex, previousType);
        if (tokenDecode(tokens[i + 1])[1] === TokenType.newline) {
          newline = true;
        }
        break;

      case TokenType.identifier:
        currString += extractStringFromFile(currTokenStartIndex, previousType);
        if (getNextNonNewlineTokenType(tokens, i) === PrinterCategory.typeOrIdentifier) {
          currString += ' ';
        } else if (context === PrinterCategory.typeOrIdentifier && parenCount === 0) {
          context = PrinterCategory.doubleTypeOrIdentifier;
        }
        if (context === null) {
          context = PrinterCategory.typeOrIdentifier;
        }
        break;

      default:
        break;
    }
    formattedFileStr += currString;
    previousType = currTokenType;
    currString = '';
  }
  if (
    tokenDecode(tokens[tokenArray.getCount() - 1])[1] === TokenType.newline &&
    formattedFileStr !== ''
  ) {
    formattedFileStr += '\n';
  }
  return formattedFileStr;
}
