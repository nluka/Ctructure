import TokenType from '../lexer/TokenType';
import Stack from './context_stack/Stack';
import getNextNonNewlineTokenType from './nextNonNewlineTokenType';
import { Context } from './printer';
import PrinterCategory from './PrinterCategory';

export default function trackIndentationDepthDuringNoFormat(
  tokenTypes: Uint8Array,
  tokenCount: number,
  index: number,
  indentationDepth: number,
  multiVarAlwaysNewline: boolean,
  contextStack: Stack,
  context: Context,
  previousType: TokenType | null,
  overflow: boolean,
  parenDepth: number,
  noFormatType:
    | TokenType.commentNoFormatMultiline
    | TokenType.commentNoFormatSingleLine,
): {
  indentationDepth: number;
  contextStack: Stack;
  context: Context;
  previousType: TokenType | null;
  overflow: boolean;
  parenDepth: number;
} {
  let newLineCount: number = 0;
  let nextNonNewlineTokenType: TokenType | null;
  let previousContext: {
    context: Context;
    overflow: boolean;
    indentationLevel: number;
  } | null = null;
  function decreaseBlockLevel() {
    indentationDepth > 0 ? --indentationDepth : 0;
  }

  for (let i = index + 1; i < tokenCount; ++i) {
    const currTokenType = tokenTypes[i];
    switch (currTokenType) {
      case TokenType.newline:
        if (noFormatType === TokenType.commentNoFormatSingleLine) {
          if (++newLineCount === 2) {
            return {
              indentationDepth: indentationDepth,
              contextStack: contextStack,
              context: context,
              previousType: previousType,
              overflow: overflow,
              parenDepth: parenDepth,
            };
          }
        }
        continue;

      case TokenType.specialComma:
        if (
          context === PrinterCategory.variableDecl ||
          context === PrinterCategory.doubleTypeOrIdentifier
        ) {
          context = PrinterCategory.multiVariableDecl;
        }
        break;

      case TokenType.specialSemicolon:
        if (context === TokenType.keywordFor) {
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
          context === TokenType.keywordEnum ||
          context === PrinterCategory.typeDefStruct
        ) {
          context = null;
        } else {
          overflow = false;
        }
        break;

      case TokenType.specialBracketOpening:
        contextStack.push({
          context,
          overflow,
          indentationLevel: indentationDepth,
        });
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.variableDecl;
        }
        break;

      case TokenType.specialBracketClosing:
        previousContext = contextStack.pop();
        indentationDepth = previousContext.indentationLevel;
        context = previousContext.context;
        overflow = previousContext.overflow;
        break;

      case TokenType.specialParenthesisOpening:
        ++parenDepth;
        contextStack.push({
          context,
          overflow,
          indentationLevel: indentationDepth,
        });
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.functionDecl;
        } else if (previousType === TokenType.identifier) {
          context = PrinterCategory.functionCall;
        } else if (context !== TokenType.keywordFor) {
          context = null;
        }
        if (
          getNextNonNewlineTokenType(tokenTypes, tokenCount, i) ===
          TokenType.specialParenthesisClosing
        ) {
          overflow = false;
        }
        break;

      case TokenType.specialParenthesisClosing:
        if (overflow) {
          decreaseBlockLevel();
        }
        --parenDepth;
        previousContext = contextStack.pop();
        overflow = previousContext.overflow;
        indentationDepth = previousContext.indentationLevel;
        nextNonNewlineTokenType = getNextNonNewlineTokenType(
          tokenTypes,
          tokenCount,
          i,
        );
        if (
          previousContext.context === TokenType.keywordIf ||
          (previousContext.context === TokenType.keywordFor && parenDepth === 0)
        ) {
          if (nextNonNewlineTokenType !== TokenType.specialBraceOpening) {
            context = PrinterCategory.singleLineIf;
            contextStack.push({
              context,
              overflow,
              indentationLevel: indentationDepth,
            });
            ++indentationDepth;
          } else {
            context = null;
          }
          break;
        }
        context = previousContext.context;
        break;

      case TokenType.specialBraceOpening:
        contextStack.push({
          context,
          overflow,
          indentationLevel: indentationDepth,
        });
        if (context === PrinterCategory.array) {
        } else if (previousType === TokenType.operatorBinaryAssignmentDirect) {
          context = PrinterCategory.array;
        } else {
          context = null;
        }
        ++indentationDepth;
        break;

      case TokenType.specialBraceClosing:
        previousContext = contextStack.pop();
        indentationDepth = previousContext.indentationLevel;
        nextNonNewlineTokenType = getNextNonNewlineTokenType(
          tokenTypes,
          tokenCount,
          i,
        );
        if (contextStack.peek().context === PrinterCategory.singleLineIf) {
          previousContext = contextStack.pop();
          indentationDepth = previousContext.indentationLevel;
          context = null;
          overflow = false;
          break;
        }
        if (context === PrinterCategory.array) {
        } else if (
          previousContext.context === TokenType.keywordEnum ||
          previousContext.context === PrinterCategory.typeDefStruct
        ) {
        } else if (
          nextNonNewlineTokenType !== TokenType.specialParenthesisClosing &&
          nextNonNewlineTokenType !== TokenType.specialSemicolon
        ) {
        }
        context = previousContext.context;
        overflow = previousContext.overflow;
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
      case TokenType.operatorMemberSelectionDirect:
      case TokenType.operatorBinaryLogicalAnd:
      case TokenType.operatorBinaryLogicalOr:
      case TokenType.operatorBinaryBitwiseAnd:
      case TokenType.operatorBinaryBitwiseOr:
      case TokenType.operatorBinaryBitwiseXor:
      case TokenType.operatorBinaryBitwiseShiftLeft:
      case TokenType.operatorBinaryBitwiseShiftRight:
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        break;

      case TokenType.operatorBinaryAssignmentDirect:
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.variableDecl;
        } else if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        break;

      case TokenType.specialColonSwitchOrLabelOrBitField:
        if (contextStack.peek().context === TokenType.keywordStruct) {
          break;
        }
        if (
          getNextNonNewlineTokenType(tokenTypes, tokenCount, i) ===
          TokenType.specialBraceOpening
        ) {
          decreaseBlockLevel();
        }
        break;

      case TokenType.ambiguousColon:
        if (
          context === TokenType.keywordCase ||
          context === TokenType.keywordDefault
        ) {
          context = null;
          if (
            getNextNonNewlineTokenType(tokenTypes, tokenCount, i) ===
            TokenType.specialBraceOpening
          ) {
            decreaseBlockLevel();
          }
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
        break;

      case TokenType.keywordElse:
        context = TokenType.keywordElse;
        nextNonNewlineTokenType = getNextNonNewlineTokenType(
          tokenTypes,
          tokenCount,
          i,
        );
        if (nextNonNewlineTokenType !== TokenType.specialBraceOpening) {
          context = PrinterCategory.singleLineIf;
          contextStack.push({
            context,
            overflow,
            indentationLevel: indentationDepth,
          });
          ++indentationDepth;
        }
        break;

      case TokenType.keywordFor:
      case TokenType.keywordIf:
        if (parenDepth === 0) {
          context = currTokenType;
        }
        break;

      case TokenType.keywordDo:
      case TokenType.keywordSwitch:
      case TokenType.keywordUnion:
        if (parenDepth === 0) {
          context = currTokenType;
        }
        break;

      case TokenType.keywordStruct:
        if (previousType === TokenType.keywordTypedef) {
          context = PrinterCategory.typeDefStruct;
        } else {
          context = TokenType.keywordStruct;
        }
        break;

      case TokenType.keywordCase:
      case TokenType.keywordDefault:
        context = currTokenType;
        previousContext = contextStack.peek();
        indentationDepth = previousContext.indentationLevel + 2;
        break;

      case TokenType.keywordReturn:
        if (
          getNextNonNewlineTokenType(tokenTypes, tokenCount, i) !==
          TokenType.specialSemicolon
        ) {
        }
        break;

      case TokenType.keywordWhile:
        if (context === TokenType.keywordDo) {
          context = null;
        }
        break;

      case TokenType.keywordEnum:
        if (parenDepth === 0) {
          context = TokenType.keywordEnum;
          overflow = true;
        }
        break;

      case TokenType.commentSingleline:
        nextNonNewlineTokenType = getNextNonNewlineTokenType(
          tokenTypes,
          tokenCount,
          i,
        );
        if (
          nextNonNewlineTokenType === TokenType.specialBraceClosing ||
          nextNonNewlineTokenType === TokenType.keywordCase ||
          nextNonNewlineTokenType === TokenType.keywordDefault
        ) {
          decreaseBlockLevel();
        }
        break;

      case TokenType.identifier:
        if (context === PrinterCategory.typeOrIdentifier && parenDepth === 0) {
          context = PrinterCategory.doubleTypeOrIdentifier;
        }
        if (context === null) {
          context = PrinterCategory.typeOrIdentifier;
        }
        break;

      case TokenType.commentNoFormatMultiline:
        return {
          indentationDepth: indentationDepth,
          contextStack: contextStack,
          context: context,
          previousType: previousType,
          overflow: overflow,
          parenDepth: parenDepth,
        };

      default:
        break;
    }
  }
  return {
    indentationDepth: indentationDepth,
    contextStack: contextStack,
    context: context,
    previousType: previousType,
    overflow: overflow,
    parenDepth: parenDepth,
  };
}
