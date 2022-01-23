import TokenArray from '../lexer/TokenArray';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import tokenFindLastIndex from '../lexer/tokenFindLastIndex';
import TokenType, {
  isTokenTypeKeyword,
  isTokenTypeOrTypeQualifierKeyword,
} from '../lexer/TokenType';
import tokenValueToTypeMap from '../lexer/tokenValueToTypeMap';
import areThereCommas from './areThereCommas';
import checkForLineOverflow from './checkForLineOverflow';
import getNextNonNewlineTokenType, {
  getNextNonNewlineTokenTypeRaw,
} from './getNextNonNewlineTokenType';
import getPrevNonNewlineTokenType from './getPrevNonNewlineTokenType';
import getIndentAmount from './indentAmount';
import PrinterCategory from './PrinterCategory';
import Stack from './Stack';
import tokenTypeToValueMap from './tokenTypeToValueMap';
import whichOccursFirst from './whichOccursFirst';

export type ContextTypes = TokenType | PrinterCategory | null;

export default function printer(
  fileContents: string,
  tokenArray: TokenArray,
  spaceAmount: number,
): string {
  const indentation = ' '.repeat(spaceAmount);
  const { startIndices: tokenStartIndices, types: tokenTypes } = tokenArray.getValues();

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
  let previousType: TokenType | null = null;

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
  let startLineIndex: number = tokenStartIndices[0];

  // Final string to be printed
  let formattedFileStr: string = '';

  let indentAmount: number = 0;

  const multiVarDecAlwaysNewLine = false;

  function isThereLineOverflow(i: number, overflowType: ContextTypes): boolean {
    overflow = checkForLineOverflow(
      fileContents,
      overflowType,
      tokenStartIndices,
      tokenTypes,
      i,
      startLineIndex,
      blockLevel,
    );
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

  function checkForIndirectionAndAddIndentation(i: number) {
    let isThereIndirection = 0;
    if (
      getNextNonNewlineTokenTypeRaw(tokenTypes, i) ===
      TokenType.operatorBinaryMultiplicationOrIndirection
    ) {
      isThereIndirection = 2;
    }
    console.log(getNextNonNewlineTokenTypeRaw(tokenTypes, i));
    currString += '\n' + ' '.repeat(indentAmount - isThereIndirection);
  }

  for (let i = 0; i < tokenArray.getCount(); ++i) {
    const currTokenStartIndex = tokenStartIndices[i];
    const currTokenType = tokenTypes[i];
    const typeAsValue = tokenTypeToValueMap.get(currTokenType);

    currString += typeAsValue;
    if (newline && currTokenType !== TokenType.commentSingleline) {
      if (
        currTokenType === TokenType.newline &&
        tokenTypes[i + 1] === TokenType.newline &&
        !noExtraNewline
      ) {
        currString = '\n\n' + indentation.repeat(blockLevel) + currString;
      } else {
        currString = '\n' + indentation.repeat(blockLevel) + currString;
      }
      noExtraNewline = false;
      newline = false;
      startLineIndex = currTokenStartIndex;
    }

    switch (currTokenType) {
      case TokenType.newline:
        if (
          context === PrinterCategory.prepro &&
          previousType !== TokenType.preproLineContinuation &&
          previousType !== TokenType.commentMultiline &&
          previousType !== TokenType.commentSingleline
        ) {
          if (tokenTypes[i + 1] === TokenType.newline) {
            currString += '\n';
          }
          newline = true;
          context = null;
        }
        continue;

      case TokenType.specialComma:
        if (overflow) {
          newline = true;
          noExtraNewline = true;
        } else if (context === PrinterCategory.multiVariableDecl) {
          if (multiVarDecAlwaysNewLine) {
            checkForIndirectionAndAddIndentation(i);
          } else {
            currString = ', ';
          }
        } else if (
          context === PrinterCategory.variableDecl ||
          context === PrinterCategory.doubleTypeOrIdentifier
        ) {
          context = PrinterCategory.multiVariableDecl;
          contextStack.push({ context, overflow, blockLevel });
          if (multiVarDecAlwaysNewLine || isThereLineOverflow(i, context)) {
            indentAmount = getIndentAmount(formattedFileStr);
            blockLevel = Math.ceil(indentAmount / 2);
            checkForIndirectionAndAddIndentation(i);
          } else {
            contextStack.pop();
            currString = ', ';
          }
        } else if (getNextNonNewlineTokenType(tokenTypes, i) === TokenType.preproLineContinuation) {
          currString = ',';
        } else {
          currString = ', ';
        }
        break;

      case TokenType.specialSemicolon:
        if (context === PrinterCategory.multiVariableDecl) {
          newline = true;
          context = null;
          if (multiVarDecAlwaysNewLine || overflow) {
            const oldContext = contextStack.pop();
            blockLevel = oldContext.blockLevel;
            overflow = oldContext.overflow;
          }
        } else if (context === PrinterCategory.singleLineIf) {
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

        if (getNextNonNewlineTokenType(tokenTypes, i) === TokenType.specialParenthesisClosing) {
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
        if (
          previousContext.context === TokenType.keywordIf ||
          (previousContext.context === TokenType.keywordFor && parenCount === 0)
        ) {
          if (getNextNonNewlineTokenType(tokenTypes, i) !== TokenType.specialBraceOpening) {
            context = PrinterCategory.singleLineIf;
            ++blockLevel;
            newline = true;
            noExtraNewline = true;
          } else {
            context = null;
          }
        } else {
          if (isTokenTypeOrTypeQualifierKeyword(getNextNonNewlineTokenTypeRaw(tokenTypes, i))) {
            currString += ' ';
          }
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
        } else if (previousType === TokenType.specialParenthesisOpening) {
          context = null;
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
          const whichOccurs: TokenType = whichOccursFirst(
            tokenTypes,
            i + 1,
            TokenType.specialSemicolon,
            TokenType.specialBraceOpening,
          );
          if (whichOccurs === TokenType.specialSemicolon) {
            if (getNextNonNewlineTokenType(tokenTypes, i) !== TokenType.specialSemicolon) {
              currString += ' ';
            }
          } else if (whichOccurs === TokenType.specialBraceOpening) {
            newline = true;
          }
        } else if (
          getNextNonNewlineTokenType(tokenTypes, i) !== TokenType.specialParenthesisClosing
        ) {
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
          previousType !== null &&
          currString === typeAsValue &&
          tokenTypes[i - 1] === TokenType.newline
        ) {
          currString = '\n' + currString;
          if (tokenTypes[i - 2] === TokenType.newline) {
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
        nextTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        previousType = getPrevNonNewlineTokenType(tokenTypes, i);
        if (
          isTokenTypeKeyword(previousType) ||
          previousType === TokenType.identifier ||
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
      case TokenType.operatorMemberSelectionIndirect:
      case TokenType.ambiguousPlus:
      case TokenType.ambiguousMinus:
        nextTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        if (previousType === TokenType.specialComma) {
          if (nextTokenType === TokenType.specialComma) {
            currString = currString.trimStart().trimEnd();
          } else {
            currString = currString.trimStart();
          }
        } else {
        }
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        break;

      case TokenType.operatorMemberSelectionDirect:
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
          getNextNonNewlineTokenType(tokenTypes, i) !== PrinterCategory.typeOrIdentifier &&
          getNextNonNewlineTokenType(tokenTypes, i, 1) !== TokenType.specialParenthesisOpening &&
          !areThereCommas(tokenTypes, i) &&
          isThereLineOverflow(i, TokenType.operatorBinaryAssignmentDirect)
        ) {
          currString = ' =\n' + indentation.repeat(blockLevel + 1);
        }
        break;

      // Miscellanous operators
      case TokenType.ambiguousColon:
        if (context === TokenType.keywordCase || context === TokenType.keywordDefault) {
          context = null;
          if (getNextNonNewlineTokenType(tokenTypes, i) !== TokenType.specialBraceOpening) {
            newline = true;
            noExtraNewline = true;
          } else {
            --blockLevel;
          }
        } else {
          currString = ' : ';
        }
        break;

      // Keywords (https://en.cppreference.com/w/c/keyword)
      case TokenType.keywordElse:
        context = TokenType.keywordElse;
        if (previousType === TokenType.specialBraceClosing) {
          currString = ' else';
        }
        nextTokenType = getNextNonNewlineTokenType(tokenTypes, i);
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
        nextTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        if (
          nextTokenType === PrinterCategory.typeOrIdentifier ||
          nextTokenType === PrinterCategory.typeQualifier
        ) {
          currString += ' ';
        } else if (nextTokenType === TokenType.specialParenthesisOpening) {
          currString += ' ';
        }
        break;

      case TokenType.keywordFor:
      case TokenType.keywordIf:
        if (parenCount === 0) {
          context = currTokenType;
        }
        break;

      case TokenType.keywordDo:
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
        if (getNextNonNewlineTokenType(tokenTypes, i) !== TokenType.specialSemicolon) {
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
        nextTokenType = getNextNonNewlineTokenType(tokenTypes, i);
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
          previousType !== null &&
          (tokenTypes[i - 1] !== TokenType.newline || currString === '')
        ) {
          currString = ' ';
        }
        currString += extractStringFromFile(currTokenStartIndex, previousType);
        if (tokenTypes[i + 1] === TokenType.newline) {
          newline = true;
        }
        nextTokenType = getNextNonNewlineTokenType(tokenTypes, i);
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
        if (tokenTypes[i + 1] === TokenType.newline) {
          newline = true;
        }
        break;

      case TokenType.identifier:
        const extractedIdentifier = extractStringFromFile(currTokenStartIndex, previousType);
        currString += extractedIdentifier;
        if (getNextNonNewlineTokenType(tokenTypes, i) === PrinterCategory.typeOrIdentifier) {
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
  if (tokenTypes[tokenArray.getCount() - 1] === TokenType.newline && formattedFileStr !== '') {
    formattedFileStr += '\n';
  }
  return formattedFileStr;
}
