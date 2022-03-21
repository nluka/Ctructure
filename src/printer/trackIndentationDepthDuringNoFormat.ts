import TokenType from '../lexer/TokenType';
import Stack from './context_stack/Stack';
import getNextNonNewlineTokenType from './nextNonNewlineTokenType';
import { Context } from './printer';
import PrinterCategory from './PrinterCategory';

export default function trackIndentationDepthDuringNoFormat(
  tokTypes: Uint8Array,
  tokCount: number,
  index: number,
  indentationDepth: number,
  multiVarAlwaysNewline: boolean,
  contextStack: Stack,
  context: Context,
  prevType: TokenType | null,
  overflow: boolean,
  parenDepth: number,
  noFormatType:
    | TokenType.commentDirectiveNoFormatMultiLine
    | TokenType.commentDirectiveNoFormatSingleLine,
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
    indentationDepth: number;
  } | null = null;

  function decreaseBlockLevel() {
    indentationDepth > 0 ? --indentationDepth : 0;
  }

  for (let i = index + 1; i < tokCount; ++i) {
    const currTokenType = tokTypes[i];
    switch (currTokenType) {
      case TokenType.newline:
        if (noFormatType === TokenType.commentDirectiveNoFormatSingleLine) {
          if (++newLineCount === 2) {
            return {
              indentationDepth: indentationDepth,
              contextStack: contextStack,
              context: context,
              previousType: prevType,
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
        if (context === PrinterCategory.assignmentOverflow) {
          decreaseBlockLevel();
          context = null;
          overflow = false;
        } else if (context === PrinterCategory.multiVariableDecl) {
          context = null;
          if (multiVarAlwaysNewline || overflow) {
            indentationDepth = contextStack.pop().indentationDepth;
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
        break;

      case TokenType.specialBracketOpening:
        contextStack.push({
          context,
          overflow,
          indentationDepth,
        });
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.variableDecl;
        }
        break;

      case TokenType.specialBracketClosing:
        previousContext = contextStack.pop();
        indentationDepth = previousContext.indentationDepth;
        context = previousContext.context;
        overflow = previousContext.overflow;
        break;

      case TokenType.specialParenthesisOpening:
        ++parenDepth;
        contextStack.push({
          context,
          overflow,
          indentationDepth,
        });
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.functionDecl;
        } else if (prevType === TokenType.identifier) {
          context = PrinterCategory.functionCall;
        } else if (context !== TokenType.keywordFor) {
          context = null;
        }
        if (
          getNextNonNewlineTokenType(tokTypes, tokCount, i) ===
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
        indentationDepth = previousContext.indentationDepth;
        nextNonNewlineTokenType = getNextNonNewlineTokenType(
          tokTypes,
          tokCount,
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
              indentationDepth,
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
          indentationDepth,
        });
        if (prevType === TokenType.operatorBinaryAssignmentDirect) {
          context = PrinterCategory.array;
        } else if (context !== PrinterCategory.array) {
          context = null;
        }
        ++indentationDepth;
        break;

      case TokenType.specialBraceClosing:
        previousContext = contextStack.pop();
        indentationDepth = previousContext.indentationDepth;
        nextNonNewlineTokenType = getNextNonNewlineTokenType(
          tokTypes,
          tokCount,
          i,
        );
        if (contextStack.peek().context === PrinterCategory.singleLineIf) {
          previousContext = contextStack.pop();
          indentationDepth = previousContext.indentationDepth;
          context = null;
          overflow = false;
          break;
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
          getNextNonNewlineTokenType(tokTypes, tokCount, i) ===
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
            getNextNonNewlineTokenType(tokTypes, tokCount, i) ===
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
          tokTypes,
          tokCount,
          i,
        );
        if (nextNonNewlineTokenType !== TokenType.specialBraceOpening) {
          context = PrinterCategory.singleLineIf;
          contextStack.push({
            context,
            overflow,
            indentationDepth,
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
          context = TokenType.keywordStruct;
        }
        break;

      case TokenType.keywordCase:
      case TokenType.keywordDefault:
        context = currTokenType;
        previousContext = contextStack.peek();
        indentationDepth = previousContext.indentationDepth + 2;
        break;

      case TokenType.keywordWhile:
        if (context === TokenType.keywordDo) {
          context = null;
        }
        break;

      case TokenType.keywordStruct:
        if (prevType === TokenType.keywordTypedef) {
          context = PrinterCategory.typeDefStruct;
        }
        if (parenDepth === 0) {
          context = PrinterCategory.typeOrIdentifier;
        }
        break;

      case TokenType.keywordEnum:
        if (prevType === TokenType.keywordTypedef) {
          context = PrinterCategory.typeDefStruct;
          overflow = true;
        }
        if (parenDepth === 0) {
          context = TokenType.keywordStruct;
          overflow = true;
        }
        break;

      case TokenType.commentSingleLine:
        nextNonNewlineTokenType = getNextNonNewlineTokenType(
          tokTypes,
          tokCount,
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

      case TokenType.commentDirectiveNoFormatMultiLine:
        return {
          indentationDepth: indentationDepth,
          contextStack: contextStack,
          context: context,
          previousType: prevType,
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
    previousType: prevType,
    overflow: overflow,
    parenDepth: parenDepth,
  };
}
