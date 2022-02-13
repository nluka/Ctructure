import defaultConfig from '../config/defaultConfig';
import IConfig from '../config/IConfig';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import tokenFindEndPosition from '../lexer/tokenFindEndPosition';
import TokenSet from '../lexer/TokenSet';
import TokenType, {
  isTokenBinaryOperator,
  isTokenConstant,
  isTokenKeyword,
  isTokenKeywordTypeOrTypeQualifier,
  isTokenKeywordTypeQualifier,
} from '../lexer/TokenType';
import areThereCommas from './areThereCommas';
import checkForAssignmentToFunction from './checkForAssignmentToFunction';
import Stack from './context_stack/Stack';
import getIndentAmountForMultiVar from './indentAmountForMultiVar';
import _nextNonNewlineTokenType from './nextNonNewlineTokenType';
import getPrevNonNewlineTokenType from './prevNonNewlineTokenType';
import PrinterCategory from './PrinterCategory';
import tokenTypeToValueMap from './tokenTypeToValueMap';
import trackIndentationDepthDuringNoFormat from './trackIndentationDepthDuringNoFormat';
import whichOccursFirst from './whichOccursFirst';

export type Context =
  | TokenType.keywordFor
  | TokenType.keywordIf
  | TokenType.keywordDefault
  | TokenType.keywordCase
  | TokenType.keywordElse
  | TokenType.keywordDo
  | TokenType.keywordStruct
  | TokenType.keywordUnion
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
  tokenArray: TokenSet,
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

  let shouldAddNewline = false;

  // When true, no extra new lines are allowed
  let noExtraNewline = false;

  let indentationDepth = 0;

  let parenDepth = 0;

  let currString = '';

  let nextNonNewlineTokenType: TokenType | null;

  let previousTokenType: TokenType | null = null;

  // Determines how a token should behave
  let context: Context = null;

  // Stores context when opening parentheses/braces/brackets are present
  let contextStack = new Stack();

  // Holds the popped context from `contextStack`
  let previousContext: {
    context: Context;
    overflow: boolean;
    indentationLevel: number;
  } | null = null;

  // Used in determining if there is line overflow
  let startLineIndex = tokenStartIndices[0];

  // Final string to be written to file
  let formattedStr = '';

  let indentAmountForMultiVar = 0;

  function isThereLineOverflow(i: number, overflowType: TokenTypeOverflowable): boolean {
    function checkOverflowWithMarker(
      marker: TokenType.specialSemicolon | TokenType.specialComma | TokenType.specialBraceClosing,
      tokenIndex: number,
      indentationWhiteSpace: number,
    ): boolean {
      let lineLength;
      let bracketCount = 0;
      let whiteSpace = 2 + indentationWhiteSpace;

      for (let i = tokenIndex; bracketCount >= 0 && i < tokenCount; ++i) {
        if (tokenTypes[i] === marker) {
          lineLength =
            fileContents.slice(startLineIndex, tokenStartIndices[i]).replace(/\s/g, '').length +
            whiteSpace;
          if (lineLength > lineWidth) {
            return true;
          }
          return false;
        }
        if (doesTokenIncreaseWhiteSpace(tokenTypes[i])) {
          whiteSpace += 2;
        }
      }
      return false;
    }

    function checkOverflowWithEnclosure(
      overflowMarkerOpening: TokenTypeOverflowable,
      overflowMarkerClosing:
        | TokenType.specialParenthesisClosing
        | TokenType.specialBraceClosing
        | TokenType.specialBracketClosing,
      tokenIndex: number,
      indentationWhiteSpace: number,
    ): boolean {
      let lineLength;
      let overflowMarker = 0;
      let whiteSpace = 2 + indentationWhiteSpace;

      for (let i = tokenIndex; overflowMarker >= 0 && i < tokenCount; ++i) {
        const currTokenType = tokenTypes[i];
        if (currTokenType === overflowMarkerOpening) {
          ++overflowMarker;
        } else if (currTokenType === overflowMarkerClosing) {
          --overflowMarker;
          if (overflowMarker === 0) {
            lineLength =
              fileContents.slice(startLineIndex, tokenStartIndices[i]).replace(/\s/g, '').length +
              whiteSpace;
            if (lineLength > lineWidth) {
              return true;
            }
            return false;
          }
        } else if (currTokenType === TokenType.specialComma) {
          ++whiteSpace;
        } else if (doesTokenIncreaseWhiteSpace(currTokenType)) {
          whiteSpace += 2;
        }
      }
      return false;
    }

    function doesTokenIncreaseWhiteSpace(type: TokenType): boolean {
      return isTokenBinaryOperator(type);
    }

    if (overflowType === TokenType.specialParenthesisOpening) {
      return (overflow = checkOverflowWithEnclosure(
        TokenType.specialParenthesisOpening,
        TokenType.specialParenthesisClosing,
        i,
        getIndentation(indentationDepth).length,
      ));
    }
    if (overflowType === TokenType.specialBraceOpening) {
      return (overflow = checkOverflowWithEnclosure(
        TokenType.specialBraceOpening,
        TokenType.specialBraceClosing,
        i,
        getIndentation(indentationDepth).length,
      ));
    }
    if (overflowType === TokenType.specialBracketOpening) {
      return (overflow = checkOverflowWithEnclosure(
        TokenType.specialBracketOpening,
        TokenType.specialBracketClosing,
        i,
        getIndentation(indentationDepth).length,
      ));
    }
    return (overflow = checkOverflowWithMarker(
      overflowType,
      i,
      getIndentation(indentationDepth).length,
    ));
  }

  function extractStringFromFile(startPos: number): string {
    return fileContents.slice(
      startPos,
      tokenFindEndPosition(fileContents, startPos, tokenDetermineCategory(fileContents, startPos)) +
        1,
    );
  }

  function checkForIndirectionAndAddIndentation(i: number) {
    let isThereIndirection = 0;
    if (getNextNonNewlineTokenType(i) === TokenType.operatorUnaryIndirectionOrDereference) {
      isThereIndirection = 2;
    }
    currString += lineEndings + ' '.repeat(indentAmountForMultiVar - isThereIndirection);
  }

  function getIndentation(indentationDepth: number) {
    return indentation.repeat(indentationDepth);
  }

  function decreaseBlockLevel() {
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

  function getNextNonNewlineTokenType(i: number): TokenType {
    return _nextNonNewlineTokenType(tokenTypes, tokenCount, i);
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
        currString = lineEndings + getIndentation(indentationDepth) + typeAsValue;
      }
      noExtraNewline = false;
      shouldAddNewline = false;
      startLineIndex = currTokStartPos;
    }

    switch (currTokType) {
      case TokenType.newline: {
        continue;
      }

      case TokenType.specialComma: {
        if (context === PrinterCategory.multiVariableDecl && (multiVarAlwaysNewline || overflow)) {
          checkForIndirectionAndAddIndentation(i);
        } else if (overflow) {
          shouldAddNewline = true;
          noExtraNewline = true;
        } else if (
          context === PrinterCategory.variableDecl ||
          context === PrinterCategory.doubleTypeOrIdentifier
        ) {
          context = PrinterCategory.multiVariableDecl;
          if (multiVarAlwaysNewline || isThereLineOverflow(i, TokenType.specialSemicolon)) {
            contextStack.push({ context, overflow, indentationLevel: indentationDepth });
            if (multiVarMatchIndent) {
              indentAmountForMultiVar = getIndentAmountForMultiVar(formattedStr);
            } else {
              indentAmountForMultiVar = getIndentation(1 + indentationDepth).length;
            }
            indentationDepth =
              indentationChar === '\t'
                ? Math.ceil(indentAmountForMultiVar / 4)
                : Math.ceil(indentAmountForMultiVar / indentationSize);
            checkForIndirectionAndAddIndentation(i);
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
          nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
          if (
            nextNonNewlineTokenType === TokenType.specialSemicolon ||
            nextNonNewlineTokenType === TokenType.specialParenthesisClosing
          ) {
            currString = ';';
          } else {
            currString = '; ';
          }
          break;
        }
        if (context === PrinterCategory.assignmentOverflow) {
          decreaseBlockLevel();
          context = null;
          overflow = false;
        } else if (context === PrinterCategory.multiVariableDecl) {
          context = null;
          if (multiVarAlwaysNewline || overflow) {
            indentationDepth = contextStack.pop().indentationLevel;
            overflow = false;
          }
        } else if (context === PrinterCategory.singleLineIf) {
          contextStack.pop();
          decreaseBlockLevel();
          context = null;
        } else if (
          context === PrinterCategory.variableDecl ||
          context === PrinterCategory.typeDefStruct
        ) {
          context = null;
        } else {
          overflow = false;
        }
        shouldAddNewline = true;
        break;
      }

      case TokenType.specialBracketOpening: {
        contextStack.push({ context, overflow, indentationLevel: indentationDepth });
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.variableDecl;
        }
        if (isThereLineOverflow(i, TokenType.specialBracketOpening)) {
          ++indentationDepth;
          shouldAddNewline = true;
        }
        break;
      }

      case TokenType.specialBracketClosing: {
        previousContext = contextStack.pop();
        indentationDepth = previousContext.indentationLevel;
        if (overflow) {
          currString = lineEndings + getIndentation(indentationDepth) + currString;
        }
        context = previousContext.context;
        overflow = previousContext.overflow;
        break;
      }

      case TokenType.specialParenthesisOpening: {
        ++parenDepth;
        contextStack.push({ context, overflow, indentationLevel: indentationDepth });
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.functionDecl;
        } else if (previousTokenType === TokenType.identifier) {
          context = PrinterCategory.functionCall;
        } else if (context !== TokenType.keywordFor) {
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
          decreaseBlockLevel();
          currString = lineEndings + getIndentation(indentationDepth) + ')';
          startLineIndex = currTokStartPos;
        }
        --parenDepth;
        previousContext = contextStack.pop();
        overflow = previousContext.overflow;
        indentationDepth = previousContext.indentationLevel;
        nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
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
        if (isTokenKeywordTypeOrTypeQualifier(nextNonNewlineTokenType)) {
          currString += ' ';
        }
        context = previousContext.context;
        break;
      }

      case TokenType.specialBraceOpening: {
        contextStack.push({ context, overflow, indentationLevel: indentationDepth });
        if (context === PrinterCategory.array) {
          if (!isThereLineOverflow(i, TokenType.specialBraceOpening)) {
            currString += ' ';
            break;
          }
        } else if (previousTokenType === TokenType.operatorBinaryAssignmentDirect) {
          context = PrinterCategory.array;
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
        indentationDepth = previousContext.indentationLevel;
        currString = lineEndings + getIndentation(indentationDepth) + '}';
        startLineIndex = currTokStartPos;
        nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
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
            if (
              previousTokenType === TokenType.specialComma ||
              previousTokenType === TokenType.specialBraceOpening
            ) {
              currString = '}';
            } else {
              currString = ' }';
            }
          }
        } else if (previousContext.context === PrinterCategory.typeDefStruct) {
          currString += ' ';
        } else if (
          nextNonNewlineTokenType !== TokenType.specialParenthesisClosing &&
          nextNonNewlineTokenType !== TokenType.specialSemicolon
        ) {
          shouldAddNewline = true;
        }
        context = previousContext.context;
        overflow = previousContext.overflow;
        break;
      }

      case TokenType.preproHash: {
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
        nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        previousTokenType = getPrevNonNewlineTokenType(tokenTypes, tokenCount, i);
        if (
          isTokenKeyword(previousTokenType) ||
          previousTokenType === TokenType.identifier ||
          previousTokenType === TokenType.specialParenthesisClosing
        ) {
          currString = ' *';
        }
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
      case TokenType.operatorBinaryComparisonLessThanOrEqualTo:
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
        nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
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
        if (
          parenDepth === 0 &&
          context !== PrinterCategory.array &&
          isThereLineOverflow(i, TokenType.specialSemicolon)
        ) {
          currString = `${typeAsValue}`;
          context = PrinterCategory.assignmentOverflow;
          shouldAddNewline = true;
          noExtraNewline = true;
        }
        break;
      }

      case TokenType.operatorBinaryBitwiseAnd:
      case TokenType.operatorBinaryBitwiseOr:
      case TokenType.operatorBinaryBitwiseXor:
      case TokenType.operatorBinaryBitwiseShiftLeft:
      case TokenType.operatorBinaryBitwiseShiftRight: {
        nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
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
          if (context !== PrinterCategory.array) {
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
          shouldAddNewline = true;
          break;
        }
        currString += ' ';
        break;
      }

      case TokenType.operatorBinaryAssignmentDirect: {
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.variableDecl;
        } else if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (
          parenDepth === 0 &&
          !areThereCommas(tokenTypes, i) &&
          !checkForAssignmentToFunction(tokenTypes, tokenCount, i) &&
          nextNonNewlineTokenType !== TokenType.specialBraceOpening &&
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
      }

      case TokenType.specialColonSwitchOrLabelOrBitField: {
        if (contextStack.peek().context === TokenType.keywordStruct) {
          currString = ': ';
          break;
        }
        if (getNextNonNewlineTokenType(i) === TokenType.specialBraceOpening) {
          decreaseBlockLevel();
          break;
        }
        shouldAddNewline = true;
        noExtraNewline = true;
        break;
      }

      case TokenType.speicalLineContinuation: {
        shouldAddNewline = true;
        noExtraNewline = true;
        break;
      }

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
        nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
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

      case TokenType.keywordElse: {
        context = TokenType.keywordElse;
        if (previousTokenType === TokenType.specialBraceClosing) {
          currString = ' else';
        }
        nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (nextNonNewlineTokenType === TokenType.keywordIf) {
          currString += ' ';
        } else if (nextNonNewlineTokenType !== TokenType.specialBraceOpening) {
          context = PrinterCategory.singleLineIf;
          contextStack.push({ context, overflow, indentationLevel: indentationDepth });
          shouldAddNewline = true;
          noExtraNewline = true;
          ++indentationDepth;
        }
        break;
      }

      case TokenType.keywordFor:
      case TokenType.keywordIf: {
        if (parenDepth === 0) {
          context = currTokType;
        }
        break;
      }

      case TokenType.keywordDo:
      case TokenType.keywordSwitch:
      case TokenType.keywordUnion: {
        if (parenDepth === 0) {
          context = currTokType;
        }
        if (previousTokenType === TokenType.specialParenthesisClosing) {
          currString = ' ' + currString;
        }
        break;
      }

      case TokenType.keywordCase:
      case TokenType.keywordDefault: {
        context = currTokType;
        previousContext = contextStack.peek();
        currString =
          lineEndings +
          getIndentation(previousContext.indentationLevel + 1) +
          tokenTypeToValueMap.get(currTokType);
        indentationDepth = previousContext.indentationLevel + 2;
        break;
      }

      case TokenType.keywordReturn: {
        if (getNextNonNewlineTokenType(i) !== TokenType.specialSemicolon) {
          currString += ' ';
        }
        break;
      }

      case TokenType.keywordWhile: {
        if (context === TokenType.keywordDo) {
          currString = ' while ';
          context = null;
        }
        break;
      }

      case TokenType.keywordStruct: {
        if (previousTokenType === TokenType.keywordTypedef) {
          context = PrinterCategory.typeDefStruct;
        } else if (parenDepth === 0) {
          context = TokenType.keywordStruct;
        }
        break;
      }

      case TokenType.keywordEnum: {
        if (previousTokenType === TokenType.keywordTypedef) {
          context = PrinterCategory.typeDefStruct;
          overflow = true;
        } else if (parenDepth === 0) {
          overflow = true;
          break;
        }
        currString += ' ';
        break;
      }

      case TokenType.constantString: {
        currString += extractStringFromFile(currTokStartPos);
        nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (
          isTokenKeyword(nextNonNewlineTokenType) ||
          nextNonNewlineTokenType === TokenType.identifier
        ) {
          currString += ' ';
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
          (tokenTypes[i - 1] !== TokenType.newline || currString === '')
        ) {
          currString = ' ';
        }
        currString += extractStringFromFile(currTokStartPos);
        if (tokenTypes[i + 1] === TokenType.newline) {
          shouldAddNewline = true;
        }
        nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
        if (
          nextNonNewlineTokenType === TokenType.specialBraceClosing ||
          nextNonNewlineTokenType === TokenType.keywordCase ||
          nextNonNewlineTokenType === TokenType.keywordDefault
        ) {
          decreaseBlockLevel();
        }
        break;
      }

      case TokenType.commentMultiLine: {
        if (currString === '' && previousTokenType !== null) {
          currString = ' ';
        }
        currString += extractStringFromFile(currTokStartPos);
        if (tokenTypes[i + 1] === TokenType.newline) {
          shouldAddNewline = true;
        }
        break;
      }

      case TokenType.identifier: {
        const extractedIdentifier = extractStringFromFile(currTokStartPos);
        currString += extractedIdentifier;
        nextNonNewlineTokenType = getNextNonNewlineTokenType(i);
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
        const indexOfNextNewLine = getIndexOfNextNewline(i + 1);
        const extractedString = fileContents.slice(
          tokenStartIndices[i],
          tokenStartIndices[indexOfNextNewLine],
        );

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

        i = indexOfNextNewLine - 1;
        currString += extractedString;
        shouldAddNewline = true;
        break;
      }

      case TokenType.commentDirectiveNoFormatMultiLine: {
        let j = i + 1;
        for (; j < tokenTypes.length; ++j) {
          if (tokenTypes[j] === TokenType.commentDirectiveNoFormatMultiLine) {
            break;
          }
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

        const extractedBlock = fileContents.slice(tokenStartIndices[i], tokenStartIndices[j + 1]);

        currString += extractedBlock;
        shouldAddNewline = true;
        i = j;
        break;
      }

      default: {
        break;
      }
    }

    formattedStr += currString;
    previousTokenType = currTokType;
    currString = '';
  }

  if (tokenTypes[tokenCount - 1] === TokenType.newline && formattedStr !== '') {
    formattedStr += lineEndings;
  }

  return formattedStr;
}
