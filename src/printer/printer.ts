import defaultConfig from '../config/defaultConfig';
import IConfig from '../config/IConfig';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import tokenFindEndPosition from '../lexer/tokenFindEndPosition';
import _TokenSet from '../lexer/TokenSet';
import TokenType, {
  isTokenConstant,
  isTokenKeyword,
  isTokenKeywordTypeOrTypeQualifier,
  isTokenKeywordTypeQualifier,
} from '../lexer/TokenType';
import Stack from './context_stack/Stack';
import getIndentationOfFirstVar from './getIndentationOfFirstVar';
import _nextNonNewlineTokenType from './nextNonNewlineTokenType';
import PrinterCategory from './PrinterCategory';
import tokenTypeToValueMap from './tokenTypeToValueMap';
import trackIndentationDepthDuringNoFormat from './trackIndentationDepthDuringNoFormat';
import whichOccursFirst from './whichOccursFirst';
import _isThereLineOverflow from './isThereLineOverflow';
import _checkForAssignmentToFuncReturn from './checkForAssignmentToFuncReturn';
import _checkForMultiVar from './checkForMultiVar';
import checkForTypeInParen from './checkForTypeInParen';

export type Context =
  | TokenType.keywordFor
  | TokenType.keywordIf
  | TokenType.keywordWhile
  | TokenType.keywordDefault
  | TokenType.keywordCase
  | TokenType.keywordElse
  | TokenType.keywordDo
  | TokenType.keywordStruct
  | TokenType.keywordSwitch
  | PrinterCategory
  | null;

export type TokenTypeOverflowable =
  | TokenType.specialComma
  | TokenType.specialSemicolon
  | TokenType.specialBracketOpening
  | TokenType.specialBraceOpening
  | TokenType.specialParenthesisOpening
  | TokenType.specialBraceClosing;

export default function printer(
  fileContents: string,
  tokenArray: _TokenSet,
  testing: boolean = false,
): string {
  const config: IConfig = testing ? defaultConfig : require('../config/currentConfig').default;
  const {
    'printer.lineWidth': lineWidth,
    'printer.multiVariableAlwaysNewline': multiVarAlwaysNewline,
    'printer.multiVariableMatchIndent': multiVarMatchIndent,
  } = config;
  const indentationChar = config['printer.indentationType'] === 'spaces' ? ' ' : '\t';
  const indentationSize =
    config['printer.indentationType'] === 'spaces' ? config['printer.indentationSize'] : 1;
  const lineEndings = config['printer.lineEndings'] === 'lf' ? '\n' : '\r\n';
  const indentation = indentationChar.repeat(indentationSize);

  const { startIndices: tokenStartIndices, types: tokenTypes } = tokenArray.getValues();
  const tokenCount = tokenArray.getCount();

  // If true (due to line overflow), the line will split where appropriate
  let overflow = false;

  let whereToWrap: number[] = [];

  let shouldAddNewline = false;

  // When true, no extra new lines are allowed
  let noExtraNewline = false;

  let indentationDepth = 0;

  // used to match variable indentation accurately
  let indentationRemainder = 0;

  let parenDepth = 0;

  let currString = '';

  let previousTokenType: TokenType | null = null;

  // Determines how a token should behave
  let context: Context = null;

  // Stores context when opening parentheses/braces/brackets are present
  let contextStack = new Stack();

  // Holds the popped context from `contextStack`
  let previousContext: {
    context: Context;
    overflow: boolean;
    indentationDepth: number;
  } | null = null;

  // Used in determining if there is line overflow
  let startLineIndex = tokenStartIndices[0];
  let formattedStartLineIndex = 0;

  // Final string to be written to file
  let formattedStr: string[] = [];

  function checkForAssignmentToFuncReturn(index: number): boolean {
    return _checkForAssignmentToFuncReturn(index, tokenCount, tokenTypes);
  }

  function extractStringFromFile(startPos: number): string {
    return fileContents.slice(
      startPos,
      tokenFindEndPosition(fileContents, startPos, tokenDetermineCategory(fileContents, startPos)) +
        1,
    );
  }

  function wrap() {
    for (let i = 0; i < whereToWrap.length; ++i) {
      if (formattedStr.slice(formattedStartLineIndex).join('').length > lineWidth) {
        formattedStr[whereToWrap[i]] =
          formattedStr[whereToWrap[i]].trimEnd() +
          lineEndings +
          getIndentation(indentationDepth + 1);
      }
    }
    whereToWrap = [];
  }

  function isThereLineOverflow(i: number, tokenType: TokenTypeOverflowable) {
    return (overflow = _isThereLineOverflow(
      i,
      tokenType,
      lineWidth,
      tokenCount,
      getIndentation(indentationDepth).length,
      fileContents,
      startLineIndex,
      tokenTypes,
      tokenStartIndices,
    ));
  }

  function checkForMultiVar(index: number) {
    return _checkForMultiVar(index, tokenCount, tokenTypes);
  }

  function getIndentation(indentationDepth: number) {
    return indentation.repeat(indentationDepth);
  }

  function decreaseIndentationDepth() {
    indentationDepth = indentationDepth > 0 ? --indentationDepth : 0;
  }

  function getIndexOfNextNewline(index: number): number {
    for (let i = index + 1; i < fileContents.length; ++i) {
      if (tokenTypes[i] === TokenType.newline) {
        return i;
      }
    }
    return tokenTypes.length - 1;
  }

  function getNextNonNewlineTokenType(i: number, toksAhead?: number): TokenType {
    return _nextNonNewlineTokenType(tokenTypes, tokenCount, i, toksAhead);
  }

  for (let i = 0; i < tokenCount; ++i) {
    const currTokStartPos = tokenStartIndices[i];
    const currTokType = tokenTypes[i];
    const typeAsValue = tokenTypeToValueMap.get(currTokType);

    currString += typeAsValue;

    if (
      shouldAddNewline &&
      currTokType !== TokenType.commentSingleLine &&
      currTokType !== TokenType.commentMultiLine
    ) {
      if (
        currTokType === TokenType.newline &&
        tokenTypes[i + 1] === TokenType.newline &&
        !noExtraNewline
      ) {
        currString = lineEndings + lineEndings + getIndentation(indentationDepth) + typeAsValue;
      } else {
        if (
          context === PrinterCategory.multiVariableDecl &&
          multiVarMatchIndent &&
          (overflow || multiVarAlwaysNewline)
        ) {
          currString =
            lineEndings +
            getIndentation(indentationDepth) +
            ' '.repeat(indentationRemainder) +
            typeAsValue;
        } else {
          currString = lineEndings + getIndentation(indentationDepth) + typeAsValue;
        }
      }
      noExtraNewline = false;
      shouldAddNewline = false;
      startLineIndex = currTokStartPos;
      formattedStartLineIndex = i;
      whereToWrap = [];
    }

    switch (currTokType) {
      // @ts-ignore
      case TokenType.newline: {
        continue;
      }

      case TokenType.specialComma: {
        if (
          (context === PrinterCategory.multiVariableDecl && (multiVarAlwaysNewline || overflow)) ||
          (overflow && context !== TokenType.keywordFor)
        ) {
          shouldAddNewline = true;
        } else if (
          context === PrinterCategory.variableDecl ||
          context === PrinterCategory.doubleTypeOrIdentifier
        ) {
          context = PrinterCategory.multiVariableDecl;
          if (multiVarAlwaysNewline || isThereLineOverflow(i, TokenType.specialSemicolon)) {
            contextStack.push({ context, overflow, indentationDepth });
            const indentAmountForMultiVar = multiVarMatchIndent
              ? getIndentationOfFirstVar(formattedStr.join(''))
              : getIndentation(1 + indentationDepth).length;
            indentationDepth =
              indentationChar === '\t'
                ? Math.floor(indentAmountForMultiVar / 4)
                : Math.floor(indentAmountForMultiVar / indentationSize);
            indentationRemainder =
              indentAmountForMultiVar % (indentationChar === '\t' ? 4 : indentationSize);
            shouldAddNewline = true;
            noExtraNewline = true;
          } else {
            currString = ', ';
          }
        } else {
          currString = ', ';
        }
        break;
      }

      case TokenType.specialSemicolon: {
        if (context === TokenType.keywordFor) {
          const nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
          if (overflow) {
            currString = ';';
            if (nextNonNewlineTokenType !== TokenType.specialSemicolon) {
              shouldAddNewline = true;
              noExtraNewline = true;
            }
          } else if (
            nextNonNewlineTokenType === TokenType.specialSemicolon ||
            nextNonNewlineTokenType === TokenType.specialParenthesisClosing
          ) {
            currString = ';';
          } else {
            currString = '; ';
          }
          break;
        }
        if (contextStack.peek().context === PrinterCategory.singleLineIf) {
          do {
            previousContext = contextStack.pop();
          } while (contextStack.peek().context === PrinterCategory.singleLineIf);
          indentationDepth = previousContext.indentationDepth;
          overflow = false;
          shouldAddNewline = true;
          context = null;
          break;
        }
        if (context === PrinterCategory.assignmentOverflow) {
          decreaseIndentationDepth();
          context = null;
          overflow = false;
        } else if (context === PrinterCategory.multiVariableDecl) {
          context = null;
          if (multiVarAlwaysNewline || overflow) {
            indentationDepth = contextStack.pop().indentationDepth;
            overflow = false;
          }
        } else {
          overflow = false;
          context = null;
        }
        shouldAddNewline = true;
        break;
      }

      case TokenType.specialBracketOpening: {
        contextStack.push({ context, overflow, indentationDepth });
        if (isThereLineOverflow(i, TokenType.specialBracketOpening)) {
          ++indentationDepth;
          shouldAddNewline = true;
        }
        break;
      }

      case TokenType.specialBracketClosing: {
        previousContext = contextStack.pop();
        indentationDepth = previousContext.indentationDepth;
        if (overflow) {
          currString = lineEndings + getIndentation(indentationDepth) + currString;
        }
        context = previousContext.context;
        overflow = previousContext.overflow;
        break;
      }

      case TokenType.specialParenthesisOpening: {
        ++parenDepth;
        if (context === TokenType.keywordStruct) {
          context = null;
        }
        contextStack.push({ context, overflow, indentationDepth });
        if (context !== TokenType.keywordFor) {
          context = null;
        }
        if (getNextNonNewlineTokenType(i) === TokenType.specialParenthesisClosing) {
          overflow = false;
        } else if (isThereLineOverflow(i, TokenType.specialParenthesisOpening)) {
          shouldAddNewline = true;
          ++indentationDepth;
        }
        break;
      }

      case TokenType.specialParenthesisClosing: {
        if (overflow) {
          wrap();
          decreaseIndentationDepth();
          currString = lineEndings + getIndentation(indentationDepth) + ')';
          startLineIndex = currTokStartPos;
        }
        --parenDepth;
        previousContext = contextStack.pop();
        overflow = previousContext.overflow;
        indentationDepth = previousContext.indentationDepth;
        const nextNonNewlineTokenType = getNextNonNewlineTokenType(i);

        if (
          previousContext.context === TokenType.keywordIf ||
          (previousContext.context === TokenType.keywordFor && parenDepth === 0) ||
          previousContext.context === TokenType.keywordWhile
        ) {
          if (
            nextNonNewlineTokenType !== TokenType.specialBraceOpening &&
            nextNonNewlineTokenType !== TokenType.specialSemicolon
          ) {
            contextStack.push({
              context: PrinterCategory.singleLineIf,
              overflow,
              indentationDepth,
            });
            ++indentationDepth;
            shouldAddNewline = true;
            noExtraNewline = true;
          }
          context = null;
          break;
        }
        if (isTokenKeywordTypeOrTypeQualifier(nextNonNewlineTokenType)) {
          currString += ' ';
        }
        context = previousContext.context;
        break;
      }

      case TokenType.specialBraceOpening: {
        contextStack.push({ context, overflow, indentationDepth });
        if (context === PrinterCategory.array) {
          if (!overflow || !isThereLineOverflow(i, TokenType.specialBraceOpening)) {
            currString += ' ';
            break;
          }
        } else if (previousTokenType === TokenType.operatorBinaryAssignmentDirect) {
          context = PrinterCategory.array;
          contextStack.pop();
          contextStack.push({ context, overflow, indentationDepth });
          if (!isThereLineOverflow(i, TokenType.specialBraceOpening)) {
            currString += ' ';
            break;
          }
        } else if (
          previousTokenType === TokenType.specialParenthesisOpening ||
          previousTokenType === TokenType.specialSemicolon
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
      }

      case TokenType.specialBraceClosing: {
        previousContext = contextStack.pop();
        indentationDepth = previousContext.indentationDepth;
        currString = lineEndings + getIndentation(indentationDepth) + '}';
        startLineIndex = currTokStartPos;
        const nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (contextStack.peek().context === PrinterCategory.singleLineIf) {
          previousContext = contextStack.pop();
          indentationDepth = previousContext.indentationDepth;
          overflow = false;
          shouldAddNewline = true;
          if (nextNonNewlineTokenType === TokenType.keywordElse) {
            context = previousContext.context;
          } else {
            context = null;
          }
          break;
        }
        if (previousTokenType === TokenType.specialBraceOpening) {
          currString = '}';
        }
        if (
          previousContext.context === PrinterCategory.array &&
          context !== PrinterCategory.arrayWithComment
        ) {
          if (!overflow) {
            if (
              previousTokenType === TokenType.specialComma ||
              previousTokenType === TokenType.specialBraceOpening
            ) {
              currString = '}';
            } else {
              currString = ' }';
            }
          }
        } else if (
          (previousContext.context === PrinterCategory.typeDefStruct ||
            previousContext.context === TokenType.keywordStruct) &&
          nextNonNewlineTokenType !== TokenType.specialSemicolon
        ) {
          currString += ' ';
        } else if (
          nextNonNewlineTokenType !== TokenType.specialParenthesisClosing &&
          nextNonNewlineTokenType !== TokenType.specialSemicolon
        ) {
          shouldAddNewline = true;
        }
        if (previousContext.indentationDepth === 0) {
          context = null;
        } else {
          context = previousContext.context;
        }
        overflow = previousContext.overflow;
        break;
      }

      case TokenType.preproDirective: {
        const newlineIndex = getIndexOfNextNewline(i);
        currString = '';
        if (previousTokenType !== null) {
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
      }

      case TokenType.operatorUnaryIndirectionOrDereference: {
        if (
          (previousTokenType && isTokenKeyword(previousTokenType)) ||
          previousTokenType === TokenType.identifier
        ) {
          currString = ' *';
        }
        break;
      }

      case TokenType.ambiguousAsterisk: {
        if (
          previousTokenType === TokenType.specialParenthesisClosing &&
          checkForTypeInParen(i, tokenTypes)
        ) {
          currString = '*';
        } else if (currString.charAt(0) !== '\n') {
          currString = ' * ';
        }
        break;
      }

      case TokenType.ambiguousAmpersand: {
        currString = ' & ';
        break;
      }

      case TokenType.operatorBinaryArithmeticAddition:
      case TokenType.operatorBinaryArithmeticSubtraction:
      case TokenType.operatorBinaryArithmeticMultiplication:
      case TokenType.operatorBinaryArithmeticDivision:
      case TokenType.operatorBinaryArithmeticModulo:
      case TokenType.operatorBinaryComparisonEqualTo:
      case TokenType.operatorBinaryComparisonNotEqualTo:
      case TokenType.operatorBinaryComparisonGreaterThan:
      case TokenType.operatorBinaryComparisonGreaterThanOrEqualTo:
      case TokenType.operatorBinaryComparisonLessThan:
      case TokenType.operatorBinaryComparisonLessThanOrEqualTo: {
        if (previousTokenType === TokenType.specialComma) {
          if (getNextNonNewlineTokenType(i) === TokenType.specialComma) {
            currString = currString.trimStart().trimEnd();
          } else {
            currString = currString.trimStart();
          }
        }
        if (context === PrinterCategory.assignmentOverflow && parenDepth === 0 && overflow) {
          currString = currString.trimEnd();
          shouldAddNewline = true;
          noExtraNewline = true;
        } else if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        whereToWrap.push(i);
        break;
      }

      case TokenType.operatorBinaryBitwiseAnd:
      case TokenType.operatorBinaryBitwiseOr:
      case TokenType.operatorBinaryBitwiseXor: {
        const nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (previousTokenType === TokenType.specialComma) {
          if (nextNonNewlineTokenType === TokenType.specialComma) {
            currString = currString.trimStart().trimEnd();
          } else {
            currString = currString.trimStart();
          }
        }
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        if (parenDepth === 0) {
          if (context !== PrinterCategory.array && context !== PrinterCategory.arrayWithComment) {
            if (isThereLineOverflow(i, TokenType.specialSemicolon)) {
              currString = `${typeAsValue}`.trimEnd();
              context = PrinterCategory.assignmentOverflow;
              shouldAddNewline = true;
              noExtraNewline = true;
            }
          } else if (overflow) {
            if (
              isThereLineOverflow(
                i,
                whichOccursFirst(
                  tokenTypes,
                  i,
                  TokenType.specialComma,
                  TokenType.specialBraceClosing,
                ),
              )
            ) {
              currString = `${typeAsValue?.trimEnd()}\n${getIndentation(indentationDepth)}`;
            } else {
              overflow = true;
            }
          }
        }
        break;
      }

      case TokenType.operatorMemberSelectionDirect: {
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        break;
      }

      case TokenType.operatorBinaryLogicalAnd:
      case TokenType.operatorBinaryLogicalOr: {
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        if (overflow) {
          wrap();

          shouldAddNewline = true;
          break;
        }
        currString += ' ';
        break;
      }

      //@ts-ignore
      case TokenType.operatorBinaryAssignmentDirect:
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.variableDecl;
        } else if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
      case TokenType.operatorBinaryAssignmentAddition:
      case TokenType.operatorBinaryAssignmentSubtraction:
      case TokenType.operatorBinaryAssignmentMultiplication:
      case TokenType.operatorBinaryAssignmentDivision:
      case TokenType.operatorBinaryAssignmentModulo:
      case TokenType.operatorBinaryAssignmentBitwiseShiftLeft:
      case TokenType.operatorBinaryAssignmentBitwiseShiftRight:
      case TokenType.operatorBinaryAssignmentBitwiseAnd:
      case TokenType.operatorBinaryAssignmentBitwiseOr:
      case TokenType.operatorBinaryAssignmentBitwiseXor: {
        const nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (
          parenDepth === 0 &&
          !checkForMultiVar(i) &&
          nextNonNewlineTokenType !== TokenType.specialBraceOpening &&
          !overflow &&
          isThereLineOverflow(i, TokenType.specialSemicolon)
        ) {
          const temp = startLineIndex;
          startLineIndex = tokenStartIndices[i + 1];
          isThereLineOverflow(i + 1, TokenType.specialSemicolon);
          if (overflow && checkForAssignmentToFuncReturn(i)) {
            startLineIndex = temp;
            break;
          }
          context = PrinterCategory.assignmentOverflow;
          currString = currString.trimEnd();
          ++indentationDepth;
          shouldAddNewline = true;
          noExtraNewline = true;
        }
        break;
      }

      case TokenType.specialColonSwitchOrLabelOrBitField: {
        if (contextStack.peek().context === TokenType.keywordStruct) {
          currString = ': ';
          break;
        }
        if (getNextNonNewlineTokenType(i) === TokenType.specialBraceOpening) {
          decreaseIndentationDepth();
          break;
        }
        shouldAddNewline = true;
        noExtraNewline = true;
        break;
      }

      case TokenType.specialLineContinuation: {
        shouldAddNewline = true;
        noExtraNewline = true;
        break;
      }

      case TokenType.keywordVolatile:
      case TokenType.keywordConst:
        if (getNextNonNewlineTokenType(i) !== TokenType.specialParenthesisClosing) {
          currString += ' ';
        }
        break;

      case TokenType.keywordBool:
      case TokenType.keywordChar:
      case TokenType.keywordDouble:
      case TokenType.keywordFloat:
      case TokenType.keywordInt:
      case TokenType.keywordLong:
      case TokenType.keywordShort:
      case TokenType.keywordVoid: {
        if (context === null) {
          context = PrinterCategory.typeOrIdentifier;
        }
        const nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (
          isTokenKeyword(nextNonNewlineTokenType) ||
          nextNonNewlineTokenType === TokenType.identifier ||
          isTokenKeywordTypeQualifier(nextNonNewlineTokenType)
        ) {
          currString += ' ';
        } else if (nextNonNewlineTokenType === TokenType.specialParenthesisOpening) {
          currString += ' ';
        }
        break;
      }

      case TokenType.keywordSigned:
      case TokenType.keywordUnsigned: {
        const nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (
          nextNonNewlineTokenType !== TokenType.specialParenthesisClosing &&
          nextNonNewlineTokenType !== TokenType.operatorUnaryIndirectionOrDereference
        ) {
          currString += ' ';
        }
        break;
      }

      case TokenType.keywordElse: {
        if (
          previousTokenType === TokenType.specialBraceClosing &&
          context !== PrinterCategory.singleLineIf
        ) {
          currString = ' else';
        }
        context = TokenType.keywordElse;
        const nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (nextNonNewlineTokenType === TokenType.keywordIf) {
          currString += ' ';
        } else if (nextNonNewlineTokenType !== TokenType.specialBraceOpening) {
          contextStack.push({
            context: PrinterCategory.singleLineIf,
            overflow,
            indentationDepth,
          });
          shouldAddNewline = true;
          noExtraNewline = true;
          ++indentationDepth;
        }
        break;
      }

      // @ts-ignore
      case TokenType.keywordWhile:
        if (context === TokenType.keywordDo) {
          currString = ' while ';
          context = null;
          break;
        }
      case TokenType.keywordFor:
      case TokenType.keywordIf: {
        if (parenDepth === 0) {
          context = currTokType;
        }
        break;
      }
      // @ts-ignore
      case TokenType.keywordUnion:
        if (getNextNonNewlineTokenType(i) !== TokenType.specialBraceOpening) {
          currString += ' ';
        }
      case TokenType.keywordDo: {
        if (parenDepth === 0) {
          context = TokenType.keywordStruct;
        }
        break;
      }

      case TokenType.keywordCase:
      case TokenType.keywordDefault: {
        context = currTokType;
        previousContext = contextStack.peek();
        currString =
          lineEndings +
          getIndentation(previousContext.indentationDepth + 1) +
          tokenTypeToValueMap.get(currTokType);
        if (tokenTypes[i - 1] === TokenType.newline && tokenTypes[i - 2] === TokenType.newline) {
          currString = lineEndings + currString;
        }
        indentationDepth = previousContext.indentationDepth + 2;
        break;
      }

      case TokenType.keywordReturn: {
        if (getNextNonNewlineTokenType(i) !== TokenType.specialSemicolon) {
          currString += ' ';
        }
        break;
      }

      case TokenType.keywordStruct: {
        if (getNextNonNewlineTokenType(i) === TokenType.specialBraceOpening) {
          currString = currString.trimEnd();
        }
        if (parenDepth === 0) {
          context = TokenType.keywordStruct;
        }
        break;
      }

      case TokenType.keywordEnum: {
        if (getNextNonNewlineTokenType(i) === TokenType.specialBraceOpening) {
          currString = currString.trimEnd();
        }
        if (parenDepth === 0) {
          context = TokenType.keywordStruct;
          overflow = true;
        }
        break;
      }

      case TokenType.constantString: {
        currString += extractStringFromFile(currTokStartPos);
        const nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (
          isTokenKeyword(nextNonNewlineTokenType) ||
          nextNonNewlineTokenType === TokenType.identifier
        ) {
          currString += ' ';
        } else if (nextNonNewlineTokenType === currTokType) {
          shouldAddNewline = true;
        }
        break;
      }

      case TokenType.constantNumber:
      case TokenType.constantCharacter: {
        currString += extractStringFromFile(currTokStartPos);
        break;
      }

      case TokenType.commentSingleLine: {
        if (
          previousTokenType !== null &&
          (tokenTypes[i - 1] !== TokenType.newline || currString === '') &&
          formattedStr[formattedStr.length - 1].charAt(
            formattedStr[formattedStr.length - 1].length - 1,
          ) !== ' '
        ) {
          currString = ' ';
        }
        currString += extractStringFromFile(currTokStartPos);
        if (tokenTypes[i + 1] === TokenType.newline) {
          shouldAddNewline = true;
        }
        if (
          context === PrinterCategory.array &&
          previousTokenType === TokenType.specialBraceOpening &&
          !overflow
        ) {
          shouldAddNewline = true;
          noExtraNewline = true;
          ++indentationDepth;
          context = PrinterCategory.arrayWithComment;
        }
        break;
      }

      case TokenType.commentMultiLine: {
        if (
          currString === '' &&
          previousTokenType !== null &&
          previousTokenType !== TokenType.specialBracketOpening &&
          previousTokenType !== TokenType.specialParenthesisOpening &&
          formattedStr[formattedStr.length - 1].charAt(
            formattedStr[formattedStr.length - 1].length - 1,
          ) !== ' '
        ) {
          currString = ' ';
        }
        currString += extractStringFromFile(currTokStartPos);
        if (tokenTypes[i + 1] === TokenType.newline) {
          shouldAddNewline = true;
          break;
        }
        const nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (
          nextNonNewlineTokenType !== TokenType.specialParenthesisClosing &&
          nextNonNewlineTokenType !== TokenType.specialComma &&
          nextNonNewlineTokenType !== TokenType.specialSemicolon
        ) {
          currString += ' ';
        }
        break;
      }

      case TokenType.identifier: {
        currString += extractStringFromFile(currTokStartPos);
        const nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (
          isTokenKeywordTypeOrTypeQualifier(nextNonNewlineTokenType) ||
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
      }

      case TokenType.commentDirectiveNoFormatSingleLine: {
        let j = i;
        for (let count = 0; j < tokenCount - 1; ++j) {
          if (tokenTypes[j] === TokenType.newline) {
            if (++count === 2) {
              break;
            }
          }
        }

        if (j === tokenCount - 1) {
          currString += fileContents.slice(tokenStartIndices[i], fileContents.length);
          i = tokenCount;
          break;
        }

        currString += fileContents.slice(tokenStartIndices[i], tokenStartIndices[j]);

        if (currString.charAt(0) !== '\n' && previousTokenType !== null) {
          currString = ' ' + currString;
        }

        var trackedContext = trackIndentationDepthDuringNoFormat(
          tokenTypes,
          tokenCount,
          i,
          indentationDepth,
          multiVarAlwaysNewline,
          contextStack,
          context,
          previousTokenType,
          overflow,
          parenDepth,
          TokenType.commentDirectiveNoFormatSingleLine,
        );

        indentationDepth = trackedContext.indentationDepth;
        contextStack = trackedContext.contextStack;
        context = trackedContext.context;
        previousTokenType = trackedContext.previousType;
        overflow = trackedContext.overflow;
        parenDepth = trackedContext.parenDepth;

        shouldAddNewline = true;
        i = j - 1;
        break;
      }

      case TokenType.commentDirectiveNoFormatMultiLine: {
        let j = i;
        for (let count = 0; j < tokenCount - 1; ++j) {
          if (tokenTypes[j] === TokenType.commentDirectiveNoFormatMultiLine) {
            if (++count === 2) {
              break;
            }
          }
        }

        if (j === tokenCount - 1) {
          currString += fileContents.slice(tokenStartIndices[i], fileContents.length);
          i = tokenCount;
          break;
        }

        currString += fileContents.slice(tokenStartIndices[i], tokenStartIndices[j + 1]);

        if (currString.charAt(0) !== '\n' && previousTokenType !== null) {
          currString = ' ' + currString;
        }

        var trackedContext = trackIndentationDepthDuringNoFormat(
          tokenTypes,
          tokenCount,
          i,
          indentationDepth,
          multiVarAlwaysNewline,
          contextStack,
          context,
          previousTokenType,
          overflow,
          parenDepth,
          TokenType.commentDirectiveNoFormatMultiLine,
        );

        indentationDepth = trackedContext.indentationDepth;
        contextStack = trackedContext.contextStack;
        context = trackedContext.context;
        previousTokenType = trackedContext.previousType;
        overflow = trackedContext.overflow;
        parenDepth = trackedContext.parenDepth;

        shouldAddNewline = true;
        i = j;
        break;
      }

      default: {
        break;
      }
    }

    formattedStr[i] = currString;
    previousTokenType = currTokType;
    currString = '';
  }

  if (tokenTypes[tokenCount - 1] === TokenType.newline && formattedStr.join('') !== '') {
    formattedStr.push(lineEndings);
  }

  return formattedStr.join('');
}
