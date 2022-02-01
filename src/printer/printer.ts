import TokenArray from '../lexer/TokenArray';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import tokenFindLastIndex from '../lexer/tokenFindLastIndex';
import TokenType, {
  isTokenConstant,
  isTokenTypeKeyword,
  isTokenTypeOrTypeQualifierKeyword,
} from '../lexer/TokenType';
import areThereCommas from './areThereCommas';
import checkForLineOverflow from './checkForLineOverflow';
import Stack from './context_stack/Stack';
import getNextNonNewlineTokenType, {
  getNextNonNewlineTokenTypeRaw,
} from './getNextNonNewlineTokenType';
import getPrevNonNewlineTokenType from './getPrevNonNewlineTokenType';
import getIndentAmount from './indentAmount';
import PrinterCategory from './PrinterCategory';
import tokenTypeToValueMap from './tokenTypeToValueMap';
import whichOccursFirst from './whichOccursFirst';

export type ContextTypes = TokenType | PrinterCategory | null;

export default function printer(
  fileContents: string,
  tokenArray: TokenArray,
  testing: boolean = false,
): string {
  const { startIndices: tokenStartIndices, types: tokenTypes } = tokenArray.getValues();

  let config = {
    indentationSize: 2,
    indentationType: 'spaces',
    lineEndings: 'unix',
    multiVariableNewLine: false,
  };

  // Config settings
  if (!testing) {
    import('../config').then((exports) => {
      config = exports.currentConfig;
    });
  }

  const indentationType = config.indentationType === 'spaces' ? ' ' : '\t';
  const indentationSize = config.indentationType === 'spaces' ? config.indentationSize : 1;
  const lineEndings = config.lineEndings === 'unix' ? '\n' : '\r\n';
  const multiVarAlwaysNewLine = config.multiVariableNewLine;
  const indentation = indentationType.repeat(indentationSize);

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
    currString += lineEndings + ' '.repeat(indentAmount - isThereIndirection);
  }

  function getIndentation(blockLevel: number) {
    return indentation.repeat(blockLevel);
  }

  function decreaseBlockLevel() {
    blockLevel = blockLevel > 0 ? --blockLevel : 0;
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
      newline &&
      currTokenType !== TokenType.commentSingleline &&
      currTokenType !== TokenType.commentMultiline
    ) {
      if (
        currTokenType === TokenType.newline &&
        tokenTypes[i + 1] === TokenType.newline &&
        !noExtraNewline
      ) {
        currString = lineEndings + lineEndings + getIndentation(blockLevel) + typeAsValue;
      } else {
        currString = lineEndings + getIndentation(blockLevel) + typeAsValue;
      }
      noExtraNewline = false;
      newline = false;
      startLineIndex = currTokenStartIndex;
    }

    switch (currTokenType) {
      case TokenType.newline:
        continue;

      case TokenType.specialComma:
        if (overflow) {
          newline = true;
          noExtraNewline = true;
        } else if (context === PrinterCategory.multiVariableDecl && multiVarAlwaysNewLine) {
          checkForIndirectionAndAddIndentation(i);
        } else if (
          context === PrinterCategory.variableDecl ||
          context === PrinterCategory.doubleTypeOrIdentifier
        ) {
          context = PrinterCategory.multiVariableDecl;
          if (multiVarAlwaysNewLine || isThereLineOverflow(i, context)) {
            contextStack.push({ context, overflow, blockLevel });
            indentAmount = getIndentAmount(formattedFileStr);
            blockLevel = Math.ceil(indentAmount / 2);
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
        if (context === PrinterCategory.multiVariableDecl) {
          context = null;
          if (multiVarAlwaysNewLine || overflow) {
            const oldContext = contextStack.pop();
            blockLevel = oldContext.blockLevel;
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
        newline = true;
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
          currString = lineEndings + getIndentation(blockLevel) + currString;
        }
        context = previousContext.context;
        overflow = previousContext.overflow;
        break;

      case TokenType.specialParenthesisOpening:
        ++parenCount;
        contextStack.push({ context, overflow, blockLevel });
        nextTokenType = getNextNonNewlineTokenTypeRaw(tokenTypes, i);
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.functionDecl;
        } else if (previousType === TokenType.identifier) {
          context = PrinterCategory.functionCall;
        } else if (context !== TokenType.keywordFor) {
          context = null;
        }

        if (nextTokenType === TokenType.specialParenthesisClosing) {
          overflow = false;
        } else if (isThereLineOverflow(i, context)) {
          newline = true;
          ++blockLevel;
        }
        break;

      case TokenType.specialParenthesisClosing:
        if (overflow) {
          decreaseBlockLevel();
          currString = lineEndings + getIndentation(blockLevel) + ')';
          startLineIndex = currTokenStartIndex;
        }
        --parenCount;
        previousContext = contextStack.pop();
        overflow = previousContext.overflow;
        blockLevel = previousContext.blockLevel;
        nextTokenType = getNextNonNewlineTokenTypeRaw(tokenTypes, i);
        if (
          previousContext.context === TokenType.keywordIf ||
          (previousContext.context === TokenType.keywordFor && parenCount === 0)
        ) {
          if (nextTokenType !== TokenType.specialBraceOpening) {
            context = PrinterCategory.singleLineIf;
            contextStack.push({ context, overflow, blockLevel });
            ++blockLevel;
            newline = true;
            noExtraNewline = true;
          } else {
            context = null;
          }
        } else {
          if (isTokenTypeOrTypeQualifierKeyword(nextTokenType)) {
            currString += ' ';
          }
          context = previousContext.context;
        }
        break;

      case TokenType.specialBraceOpening:
        contextStack.push({ context, overflow, blockLevel });
        if (context === PrinterCategory.array) {
          if (!isThereLineOverflow(i, context)) {
            currString += ' ';
            break;
          }
        } else if (previousType === TokenType.operatorBinaryAssignmentDirect) {
          if (context === TokenType.keywordStruct) {
            currString = '{';
          } else {
            context = PrinterCategory.array;
            if (!isThereLineOverflow(i, context)) {
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
          currString = ' ' + currString;
        }
        ++blockLevel;
        newline = true;
        break;

      case TokenType.specialBraceClosing:
        previousContext = contextStack.pop();
        blockLevel = previousContext.blockLevel;
        currString = lineEndings + getIndentation(blockLevel) + '}';
        startLineIndex = currTokenStartIndex;
        nextTokenType = getNextNonNewlineTokenTypeRaw(tokenTypes, i);
        if (contextStack.peek().context === PrinterCategory.singleLineIf) {
          previousContext = contextStack.pop();
          blockLevel = previousContext.blockLevel;
          context = null;
          overflow = false;
          newline = true;
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
            if (nextTokenType !== TokenType.specialSemicolon) {
              currString += ' ';
            }
          } else {
            newline = true;
          }
        } else if (nextTokenType !== TokenType.specialParenthesisClosing) {
          newline = true;
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
        const newLineIndex = getIndexOfNextNewline(i);
        currString = '';
        if (previousType !== null) {
          if (tokenTypes[i - 2] === TokenType.newline) {
            currString = lineEndings + lineEndings;
          } else {
            currString = lineEndings;
          }
        }
        if (newLineIndex === tokenTypes.length - 1) {
          currString += fileContents.slice(tokenStartIndices[i - 1] + 1, fileContents.length);
        } else {
          currString += fileContents.slice(
            tokenStartIndices[i - 1] + 1,
            tokenStartIndices[newLineIndex],
          );
        }
        newline = true;
        i = newLineIndex - 1;
        break;

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
          nextTokenType !== TokenType.specialParenthesisClosing &&
          nextTokenType !== TokenType.specialComma
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
          !overflow &&
          isThereLineOverflow(i, TokenType.operatorBinaryAssignmentDirect)
        ) {
          currString = ' =' + lineEndings + getIndentation(blockLevel + 1);
        }
        break;

      case TokenType.operatorSwitchColon:
        if (getNextNonNewlineTokenTypeRaw(tokenTypes, i) === TokenType.specialBraceOpening) {
          decreaseBlockLevel();
          break;
        }
        newline = true;
        noExtraNewline = true;
        break;

      case TokenType.ambiguousColon:
        if (context === TokenType.keywordCase || context === TokenType.keywordDefault) {
          context = null;
          if (getNextNonNewlineTokenType(tokenTypes, i) !== TokenType.specialBraceOpening) {
            newline = true;
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
        currString =
          lineEndings +
          getIndentation(previousContext.blockLevel + 1) +
          tokenTypeToValueMap.get(currTokenType);
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

      case TokenType.label:
        const extractedLabel = extractStringFromFile(currTokenStartIndex, previousType);
        if (
          contextStack.peek().context === TokenType.keywordSwitch &&
          extractedLabel === 'default:'
        ) {
          currString =
            lineEndings + getIndentation(contextStack.peek().blockLevel + 1) + extractedLabel;
        } else {
          currString += extractedLabel;
        }
        newline = true;
        noExtraNewline = true;
        break;

      case TokenType.constantString:
        currString += extractStringFromFile(currTokenStartIndex, previousType);
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
        nextTokenType = getNextNonNewlineTokenTypeRaw(tokenTypes, i);
        if (
          nextTokenType === TokenType.specialBraceClosing ||
          nextTokenType === TokenType.keywordCase ||
          nextTokenType === TokenType.keywordDefault
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
          newline = true;
        }
        break;

      case TokenType.identifier:
        const extractedIdentifier = extractStringFromFile(currTokenStartIndex, previousType);
        currString += extractedIdentifier;
        nextTokenType = getNextNonNewlineTokenTypeRaw(tokenTypes, i);
        if (
          isTokenTypeOrTypeQualifierKeyword(nextTokenType) ||
          nextTokenType === TokenType.identifier ||
          isTokenConstant(nextTokenType)
        ) {
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
    formattedFileStr += lineEndings;
  }
  return formattedFileStr;
}
