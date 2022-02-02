import defaultConfig from '../config/defaultConfig';
import IConfig from '../config/IConfig';
import TokenArray from '../lexer/TokenArray';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import tokenFindLastIndex from '../lexer/tokenFindLastIndex';
import TokenType, {
  isTokenConstant,
  isTokenTypeKeyword,
  isTokenTypeOrTypeQualifierKeyword,
  isTokenTypeQualifierKeyword,
} from '../lexer/TokenType';
import areThereCommas from './areThereCommas';
import checkForLineOverflow, { OverflowableContext } from './checkForLineOverflow';
import Stack from './context_stack/Stack';
import getNextNonNewlineTokenType from './getNextNonNewlineTokenType';
import getPrevNonNewlineTokenType from './getPrevNonNewlineTokenType';
import getIndentAmount from './indentAmount';
import PrinterCategory from './PrinterCategory';
import tokenTypeToValueMap from './tokenTypeToValueMap';
import whichOccursFirst from './whichOccursFirst';

export type Context =
  | TokenType.keywordFor
  | TokenType.keywordIf
  | TokenType.keywordStruct
  | TokenType.keywordEnum
  | TokenType.keywordDefault
  | TokenType.keywordCase
  | TokenType.keywordElse
  | TokenType.keywordDo
  | TokenType.keywordUnion
  | TokenType.keywordSwitch
  | PrinterCategory
  | null;

export default function printer(
  fileContents: string,
  tokenArray: TokenArray,
  testing: boolean = false,
): string {
  const { startIndices: tokenStartIndices, types: tokenTypes } = tokenArray.getValues();

  const config: IConfig = testing ? defaultConfig : require('../config/config').currentConfig;

  const indentationType = config.indentationType === 'spaces' ? ' ' : '\t';
  const indentationSize = config.indentationType === 'spaces' ? config.indentationSize : 1;
  const lineEndings = config.lineEndings === 'unix' ? '\n' : '\r\n';
  const multiVarAlwaysNewLine = config.multiVariableNewLine;
  const indentation = indentationType.repeat(indentationSize);

  // If true (due to line overflow), the line will split where it's appropriate.
  let overflow: boolean = false;

  let shouldAddNewline: boolean = false;

  // When true, no extra new lines for are allowed
  let noExtraNewline: boolean = false;

  let indentationDepth: number = 0;

  let parenDepth = 0;

  let currString: string = '';

  let nextNonNewlineTokenType: TokenType | null;

  let previousType: TokenType | null = null;

  // Determines how a token should behave
  let context: Context = null;

  // Used to store context when opening parentheses/braces/brackets are present
  let contextStack: Stack = new Stack();

  // Holds the popped context from contextStack
  let previousContext: {
    context: Context;
    overflow: boolean;
    indentationLevel: number;
  } | null = null;

  // Used in determining if there is line overflow
  let startLineIndex: number = tokenStartIndices[0];

  // Final string to be printed
  let formattedFileStr: string = '';

  let indentAmount: number = 0;

  function isThereLineOverflow(i: number, overflowType: OverflowableContext): boolean {
    overflow = checkForLineOverflow(
      fileContents,
      overflowType,
      tokenStartIndices,
      tokenTypes,
      i,
      startLineIndex,
      getIndentation(indentationDepth).length,
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
      getNextNonNewlineTokenType(tokenTypes, i) ===
      TokenType.operatorBinaryMultiplicationOrIndirection
    ) {
      isThereIndirection = 2;
    }
    currString += lineEndings + ' '.repeat(indentAmount - isThereIndirection);
  }

  function getIndentation(blockLevel: number) {
    return indentation.repeat(blockLevel);
  }

  function decreaseBlockLevel() {
    indentationDepth = indentationDepth > 0 ? --indentationDepth : 0;
  }

  function getIndexOfNextNewline(index: number): number {
    for (let i = index + 1; i < fileContents.length; ++i) {
      if (
        tokenTypes[i] === TokenType.newline &&
        tokenTypes[i - 1] !== TokenType.preproLineContinuation
      ) {
        return i;
      }
    }
    return tokenTypes.length - 1;
  }

  for (let i = 0; i < tokenArray.getCount(); ++i) {
    const currTokenStartIndex = tokenStartIndices[i];
    const currTokenType = tokenTypes[i];
    const typeAsValue = tokenTypeToValueMap.get(currTokenType);

    currString += typeAsValue;
    if (
      shouldAddNewline &&
      currTokenType !== TokenType.commentSingleline &&
      currTokenType !== TokenType.commentMultiline
    ) {
      if (
        currTokenType === TokenType.newline &&
        tokenTypes[i + 1] === TokenType.newline &&
        !noExtraNewline
      ) {
        currString = lineEndings + lineEndings + getIndentation(indentationDepth) + typeAsValue;
      } else {
        currString = lineEndings + getIndentation(indentationDepth) + typeAsValue;
      }
      noExtraNewline = false;
      shouldAddNewline = false;
      startLineIndex = currTokenStartIndex;
    }

    switch (currTokenType) {
      case TokenType.newline:
        continue;

      case TokenType.specialComma:
        if (context === PrinterCategory.multiVariableDecl && (multiVarAlwaysNewLine || overflow)) {
          checkForIndirectionAndAddIndentation(i);
        } else if (overflow) {
          shouldAddNewline = true;
          noExtraNewline = true;
        } else if (
          context === PrinterCategory.variableDecl ||
          context === PrinterCategory.doubleTypeOrIdentifier
        ) {
          context = PrinterCategory.multiVariableDecl;
          if (multiVarAlwaysNewLine || isThereLineOverflow(i, TokenType.specialSemicolon)) {
            contextStack.push({ context, overflow, indentationLevel: indentationDepth });
            indentAmount = getIndentAmount(formattedFileStr);
            indentationDepth =
              indentationType === '\t'
                ? Math.ceil(indentAmount / 4)
                : Math.ceil(indentAmount / indentationSize);
            checkForIndirectionAndAddIndentation(i);
          } else {
            currString = ', ';
          }
        } else {
          currString = ', ';
        }
        break;

      case TokenType.specialSemicolon:
        if (context === TokenType.keywordFor) {
          currString = '; ';
          break;
        }
        if (context === PrinterCategory.assignmentOverflow) {
          decreaseBlockLevel();
          context = null;
        } else if (context === PrinterCategory.multiVariableDecl) {
          context = null;
          if (multiVarAlwaysNewLine || overflow) {
            const oldContext = contextStack.pop();
            indentationDepth = oldContext.indentationLevel;
            overflow = false;
          }
        } else if (context === PrinterCategory.singleLineIf) {
          contextStack.pop();
          decreaseBlockLevel();
          context = null;
        } else if (
          context === PrinterCategory.variableDecl ||
          context === TokenType.keywordStruct ||
          context === TokenType.keywordEnum
        ) {
          context = null;
        } else {
          overflow = false;
        }
        shouldAddNewline = true;
        break;

      case TokenType.specialBracketOpening:
        contextStack.push({ context, overflow, indentationLevel: indentationDepth });
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.variableDecl;
        }
        if (isThereLineOverflow(i, TokenType.specialBracketOpening)) {
          ++indentationDepth;
          shouldAddNewline = true;
        }
        break;

      case TokenType.specialBracketClosing:
        previousContext = contextStack.pop();
        indentationDepth = previousContext.indentationLevel;
        if (overflow) {
          currString = lineEndings + getIndentation(indentationDepth) + currString;
        }
        context = previousContext.context;
        overflow = previousContext.overflow;
        break;

      case TokenType.specialParenthesisOpening:
        ++parenDepth;
        contextStack.push({ context, overflow, indentationLevel: indentationDepth });
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.functionDecl;
        } else if (previousType === TokenType.identifier) {
          context = PrinterCategory.functionCall;
        } else if (context !== TokenType.keywordFor) {
          context = null;
        }
        if (getNextNonNewlineTokenType(tokenTypes, i) === TokenType.specialParenthesisClosing) {
          overflow = false;
        } else if (isThereLineOverflow(i, TokenType.specialParenthesisOpening)) {
          shouldAddNewline = true;
          ++indentationDepth;
        }
        break;

      case TokenType.specialParenthesisClosing:
        if (overflow) {
          decreaseBlockLevel();
          currString = lineEndings + getIndentation(indentationDepth) + ')';
          startLineIndex = currTokenStartIndex;
        }
        --parenDepth;
        previousContext = contextStack.pop();
        overflow = previousContext.overflow;
        indentationDepth = previousContext.indentationLevel;
        nextNonNewlineTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        if (
          previousContext.context === TokenType.keywordIf ||
          (previousContext.context === TokenType.keywordFor && parenDepth === 0)
        ) {
          if (nextNonNewlineTokenType !== TokenType.specialBraceOpening) {
            context = PrinterCategory.singleLineIf;
            contextStack.push({ context, overflow, indentationLevel: indentationDepth });
            ++indentationDepth;
            shouldAddNewline = true;
            noExtraNewline = true;
          } else {
            context = null;
          }
          break;
        }
        if (isTokenTypeOrTypeQualifierKeyword(nextNonNewlineTokenType)) {
          currString += ' ';
        }
        context = previousContext.context;
        break;

      case TokenType.specialBraceOpening:
        contextStack.push({ context, overflow, indentationLevel: indentationDepth });
        if (context === PrinterCategory.array) {
          if (!isThereLineOverflow(i, TokenType.specialBraceOpening)) {
            currString += ' ';
            break;
          }
        } else if (previousType === TokenType.operatorBinaryAssignmentDirect) {
          if (context === TokenType.keywordStruct) {
            currString = '{';
          } else {
            context = PrinterCategory.array;
            if (!isThereLineOverflow(i, TokenType.specialBraceOpening)) {
              currString += ' ';
              break;
            }
          }
        } else if (
          previousType === TokenType.specialParenthesisOpening ||
          previousType === TokenType.specialSemicolon
        ) {
          context = null;
        } else {
          context = null;
          if (currString === '{') {
            currString = ' {';
          }
        }
        ++indentationDepth;
        shouldAddNewline = true;
        noExtraNewline = true;
        break;

      case TokenType.specialBraceClosing:
        previousContext = contextStack.pop();
        indentationDepth = previousContext.indentationLevel;
        currString = lineEndings + getIndentation(indentationDepth) + '}';
        startLineIndex = currTokenStartIndex;
        nextNonNewlineTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        if (contextStack.peek().context === PrinterCategory.singleLineIf) {
          previousContext = contextStack.pop();
          indentationDepth = previousContext.indentationLevel;
          context = null;
          overflow = false;
          shouldAddNewline = true;
          break;
        }
        if (context === PrinterCategory.array) {
          if (!overflow) {
            currString = ' }';
          }
        } else if (
          previousContext.context === TokenType.keywordStruct ||
          previousContext.context === TokenType.keywordEnum
        ) {
          if (
            whichOccursFirst(
              tokenTypes,
              i + 1,
              TokenType.specialSemicolon,
              TokenType.specialParenthesisOpening,
            ) === TokenType.specialSemicolon
          ) {
            if (nextNonNewlineTokenType !== TokenType.specialSemicolon) {
              currString += ' ';
            }
          } else {
            shouldAddNewline = true;
          }
        } else if (nextNonNewlineTokenType !== TokenType.specialParenthesisClosing) {
          shouldAddNewline = true;
        }
        context = previousContext.context;
        overflow = previousContext.overflow;
        break;

      case TokenType.preproDirectiveInclude:
      case TokenType.preproDirectiveDefine:
      case TokenType.preproDirectiveUndef:
      case TokenType.preproDirectiveIfdef:
      case TokenType.preproDirectiveIf:
      case TokenType.preproDirectiveIfndef:
      case TokenType.preproDirectivePragma:
      case TokenType.preproDirectiveElse:
      case TokenType.preproDirectiveEndif:
      case TokenType.preproDirectiveElif:
        const newlineIndex = getIndexOfNextNewline(i);
        currString = '';
        if (previousType !== null) {
          if (tokenTypes[i - 2] === TokenType.newline) {
            currString = lineEndings + lineEndings;
          } else {
            currString = lineEndings;
          }
        }
        if (newlineIndex === tokenTypes.length - 1) {
          currString += fileContents.slice(tokenStartIndices[i - 1] + 1, fileContents.length);
        } else {
          currString += fileContents.slice(
            tokenStartIndices[i - 1] + 1,
            tokenStartIndices[newlineIndex],
          );
        }
        shouldAddNewline = true;
        i = newlineIndex - 1;
        break;

      case TokenType.operatorBinaryMultiplicationOrIndirection:
        nextNonNewlineTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        previousType = getPrevNonNewlineTokenType(tokenTypes, i);
        if (
          isTokenTypeKeyword(previousType) ||
          previousType === TokenType.identifier ||
          previousType === TokenType.specialParenthesisClosing
        ) {
          currString = ' *';
        }
        if (
          nextNonNewlineTokenType !== TokenType.operatorBinaryMultiplicationOrIndirection &&
          nextNonNewlineTokenType !== TokenType.specialParenthesisClosing &&
          nextNonNewlineTokenType !== TokenType.specialComma
        ) {
          currString += ' ';
        }
        break;

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
        nextNonNewlineTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        if (previousType === TokenType.specialComma) {
          if (nextNonNewlineTokenType === TokenType.specialComma) {
            currString = currString.trimStart().trimEnd();
          } else {
            currString = currString.trimStart();
          }
        }
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        if (parenDepth === 0 && isThereLineOverflow(i, TokenType.specialSemicolon)) {
          currString = `${typeAsValue}`.trimEnd();
          context === PrinterCategory.assignmentOverflow;
          shouldAddNewline = true;
          noExtraNewline = true;
        }
        break;

      case TokenType.operatorMemberSelectionDirect:
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        } else if (context === TokenType.keywordStruct) {
          overflow = true;
        }
        break;

      case TokenType.operatorBinaryLogicalAnd:
      case TokenType.operatorBinaryLogicalOr:
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        if (overflow) {
          shouldAddNewline = true;
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
        nextNonNewlineTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        if (
          parenDepth === 0 &&
          !isTokenTypeKeyword(nextNonNewlineTokenType) &&
          !areThereCommas(tokenTypes, i) &&
          !overflow &&
          isThereLineOverflow(i, TokenType.specialSemicolon)
        ) {
          context = PrinterCategory.assignmentOverflow;
          currString = ' =';
          ++indentationDepth;
          shouldAddNewline = true;
          noExtraNewline = true;
        }
        break;

      case TokenType.operatorSwitchColon:
        if (getNextNonNewlineTokenType(tokenTypes, i) === TokenType.specialBraceOpening) {
          decreaseBlockLevel();
          break;
        }
        shouldAddNewline = true;
        noExtraNewline = true;
        break;

      case TokenType.ambiguousColon:
        if (context === TokenType.keywordCase || context === TokenType.keywordDefault) {
          context = null;
          if (getNextNonNewlineTokenType(tokenTypes, i) !== TokenType.specialBraceOpening) {
            shouldAddNewline = true;
            noExtraNewline = true;
          } else {
            decreaseBlockLevel();
          }
        } else {
          currString = ' : ';
        }
        break;

      case TokenType.keywordElse:
        context = TokenType.keywordElse;
        if (previousType === TokenType.specialBraceClosing) {
          currString = ' else';
        }
        nextNonNewlineTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        if (nextNonNewlineTokenType === TokenType.keywordIf) {
          currString += ' ';
        } else if (nextNonNewlineTokenType !== TokenType.specialBraceOpening) {
          context = PrinterCategory.singleLineIf;
          shouldAddNewline = true;
          noExtraNewline = true;
          ++indentationDepth;
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
        nextNonNewlineTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        if (
          isTokenTypeKeyword(nextNonNewlineTokenType) ||
          nextNonNewlineTokenType === TokenType.identifier ||
          isTokenTypeQualifierKeyword(nextNonNewlineTokenType)
        ) {
          currString += ' ';
        } else if (nextNonNewlineTokenType === TokenType.specialParenthesisOpening) {
          currString += ' ';
        }
        break;

      case TokenType.keywordFor:
      case TokenType.keywordIf:
        if (parenDepth === 0) {
          context = currTokenType;
        }
        break;

      case TokenType.keywordDo:
      case TokenType.keywordStruct:
      case TokenType.keywordSwitch:
      case TokenType.keywordUnion:
        if (parenDepth === 0) {
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
        currString =
          lineEndings +
          getIndentation(previousContext.indentationLevel + 1) +
          tokenTypeToValueMap.get(currTokenType);
        indentationDepth = previousContext.indentationLevel + 2;
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
        if (parenDepth === 0) {
          context = TokenType.keywordEnum;
          overflow = true;
        }
        break;

      case TokenType.label:
        const extractedLabel = extractStringFromFile(currTokenStartIndex, previousType);
        if (
          contextStack.peek().context === TokenType.keywordSwitch &&
          extractedLabel === 'default:'
        ) {
          currString =
            lineEndings + getIndentation(contextStack.peek().indentationLevel + 1) + extractedLabel;
        } else {
          currString += extractedLabel;
        }
        shouldAddNewline = true;
        noExtraNewline = true;
        break;

      case TokenType.constantString:
        currString += extractStringFromFile(currTokenStartIndex, previousType);
        nextNonNewlineTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        if (
          isTokenTypeKeyword(nextNonNewlineTokenType) ||
          nextNonNewlineTokenType === TokenType.identifier
        ) {
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
          shouldAddNewline = true;
        }
        nextNonNewlineTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        if (
          nextNonNewlineTokenType === TokenType.specialBraceClosing ||
          nextNonNewlineTokenType === TokenType.keywordCase ||
          nextNonNewlineTokenType === TokenType.keywordDefault
        ) {
          decreaseBlockLevel();
        }
        break;

      case TokenType.commentMultiline:
        if (currString === '') {
          currString = ' ';
        }
        currString += extractStringFromFile(currTokenStartIndex, previousType);
        if (tokenTypes[i + 1] === TokenType.newline) {
          shouldAddNewline = true;
        }
        break;

      case TokenType.identifier:
        const extractedIdentifier = extractStringFromFile(currTokenStartIndex, previousType);
        currString += extractedIdentifier;
        nextNonNewlineTokenType = getNextNonNewlineTokenType(tokenTypes, i);
        if (
          isTokenTypeOrTypeQualifierKeyword(nextNonNewlineTokenType) ||
          nextNonNewlineTokenType === TokenType.identifier ||
          isTokenConstant(nextNonNewlineTokenType)
        ) {
          currString += ' ';
        } else if (context === PrinterCategory.typeOrIdentifier && parenDepth === 0) {
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
    formattedFileStr += lineEndings;
  }
  return formattedFileStr;
}
