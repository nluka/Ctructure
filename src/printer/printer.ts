import TokenArray from '../lexer/TokenArray';
import tokenDecode from '../lexer/tokenDecode';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import tokenFindLastIndex from '../lexer/tokenFindLastIndex';
import TokenType from '../lexer/TokenType';
import PrinterCategory from './FormatCategory';
import getNextNonNewlineTokenType from './getNextNonNewlineTokenType';
import getPrevNonNewlineTokenType from './getPrevNonNewlineTokenType';
import isThereLineOverflow from './isThereLineOverflow';
import Stack from './Stack';
import tokenTypeToValueMap from './tokenTypeToValueMap';

export type Types = TokenType | PrinterCategory | null;

export default function printer(
  fileContents: string,
  tokenArray: TokenArray,
  spaceAmount: number,
): string {
  const indentation = ' '.repeat(spaceAmount);
  const tokens: Uint32Array = tokenArray.getValues();

  // If true (due to line overflow), the line will split where it's appropriate.
  let overflow: boolean = false;

  let newline: boolean = false;

  // Current indentation level
  let blockLevel: number = 0;

  // Depth of parenthesis
  let parenCount = 0;

  // Used to alter the current string before adding to the final string
  let currString: string = '';

  // Does not include newlines
  let nextTokenType: Types;

  let previousType: Types = null;

  // Determines how a token should behave
  let context: Types = null;

  let contextStack: Stack = new Stack();

  // Holds the popped context, used when closing parentheses/braces/brackets are present
  let previousContext: [Types, boolean, number] | null = null;

  // Used in determining if there is line overflow
  let startLineIndex: number = tokenDecode(tokens[0])[0];

  let formattedFileStr: string = '';

  for (
    let i = 0;
    i < tokenArray.getCount();
    ++i, nextTokenType = getNextNonNewlineTokenType(tokens, i)
  ) {
    const [position, type] = tokenDecode(tokens[i]);
    const currNodeData = tokenTypeToValueMap.get(type);

    if (currNodeData) {
      currString += currNodeData;
    }
    if (newline) {
      if (type !== TokenType.commentSingleline) {
        currString = '\n' + indentation.repeat(blockLevel) + currString;
        if (
          type === TokenType.newline &&
          tokenDecode(tokens[i + 1])[1] === TokenType.newline
        ) {
          currString = '\n' + indentation.repeat(blockLevel) + currString;
        }
        newline = false;
        startLineIndex = position - blockLevel * indentation.length;
      }
    }

    switch (type) {
      case TokenType.newline:
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
        } else if (context === PrinterCategory.variableDecl) {
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
        contextStack.push([context, overflow, blockLevel]);
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.variableDecl;
        }
        overflow = isThereLineOverflow(
          fileContents,
          TokenType.specialBracketOpening,
          tokens,
          i,
          startLineIndex,
        );
        if (overflow) {
          ++blockLevel;
          newline = true;
        }
        break;

      case TokenType.specialBracketClosing:
        previousContext = contextStack.pop();
        blockLevel = previousContext[2];
        if (overflow) {
          currString = `\n${indentation.repeat(blockLevel) + currString}`;
        }
        context = previousContext[0];
        overflow = previousContext[1];
        break;

      case TokenType.specialParenthesisOpening:
        ++parenCount;
        contextStack.push([context, overflow, blockLevel]);
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.functionDecl;
        } else if (previousType === TokenType.identifier) {
          context = PrinterCategory.functionCall;
        } else if (context !== TokenType.keywordFor) {
          context = null;
        }
        overflow = isThereLineOverflow(
          fileContents,
          context,
          tokens,
          i,
          startLineIndex,
        );
        if (overflow) {
          newline = true;
          ++blockLevel;
        }
        break;

      case TokenType.specialParenthesisClosing:
        --parenCount;
        previousContext = contextStack.pop();
        if (overflow) {
          currString = `\n${indentation.repeat(--blockLevel) + currString}`;
          startLineIndex = position;
        }
        if (previousContext[0] === TokenType.keywordFor && parenCount === 0) {
          context = null;
        } else {
          context = previousContext[0];
        }
        overflow = previousContext[1];
        blockLevel = previousContext[2];
        nextTokenType = getNextNonNewlineTokenType(tokens, i);
        if (context === TokenType.keywordIf) {
          if (nextTokenType !== TokenType.specialBraceOpening) {
            context = PrinterCategory.singleLineIf;
            ++blockLevel;
            formattedFileStr += currString;
            previousType = type;
            currString = '\n' + indentation.repeat(blockLevel);
            startLineIndex =
              tokenDecode(tokens[i + 1])[0] - blockLevel * indentation.length;
            continue;
          }
          context = null;
        }
        break;

      case TokenType.specialBraceOpening:
        contextStack.push([context, overflow, blockLevel]);
        if (
          context === PrinterCategory.variableDecl ||
          context === PrinterCategory.multiVariableDecl ||
          context === PrinterCategory.array
        ) {
          context = PrinterCategory.array;
          overflow = isThereLineOverflow(
            fileContents,
            PrinterCategory.array,
            tokens,
            i,
            startLineIndex,
          );
          if (!overflow) {
            currString += ' ';
            break;
          }
        } else {
          context = null;
          currString = ' ' + currString;
        }
        ++blockLevel;
        formattedFileStr += currString;
        previousType = type;
        currString = '\n' + indentation.repeat(blockLevel);
        startLineIndex =
          tokenDecode(tokens[i + 1])[0] - blockLevel * indentation.length;
        continue;

      case TokenType.specialBraceClosing:
        previousContext = contextStack.pop();
        blockLevel = previousContext[2];
        currString = `\n${indentation.repeat(blockLevel)}}`;
        if (context === PrinterCategory.array) {
          if (!overflow) {
            currString = ' }';
          }
          context = previousContext[0];
        } else {
          if (
            previousContext[0] === TokenType.keywordEnum ||
            previousContext[0] === TokenType.keywordStruct ||
            previousContext[0] === TokenType.keywordDo
          ) {
            if (
              getNextNonNewlineTokenType(tokens, i) !==
              TokenType.specialSemicolon
            ) {
              currString += ' ';
            }
          } else {
            newline = true;
          }
          context = null;
        }
        overflow = previousContext[1];
        break;

      // Preprocessor (https://www.cprogramming.com/reference/preprocessor/)
      case TokenType.preproOperatorConcat:
      case TokenType.preproDirectiveInclude:
      case TokenType.preproDirectiveDefine:
      case TokenType.preproDirectiveUndef:
      case TokenType.preproDirectiveIf:
      case TokenType.preproDirectiveIfdef:
      case TokenType.preproDirectiveIfndef:
      case TokenType.preproMacroFile:
      case TokenType.preproMacroLine:
      case TokenType.preproMacroDate:
      case TokenType.preproMacroTime:
      case TokenType.preproMacroTimestamp:
      case TokenType.preproDirectivePragma:
        context = PrinterCategory.prepro;
        currString += ' ';
        break;

      case TokenType.preproLineContinuation:
        newline = true;
        break;

      case TokenType.preproDirectiveEndif:
        context = PrinterCategory.prepro;
        break;

      // Unary operator:
      case TokenType.operatorUnaryArithmeticIncrementPrefix:
      case TokenType.operatorUnaryArithmeticIncrementPostfix:
      case TokenType.operatorUnaryArithmeticDecrementPrefix:
      case TokenType.operatorUnaryArithmeticDecrementPostfix:
      case TokenType.operatorUnaryBitwiseOnesComplement:
      case TokenType.operatorUnaryLogicalNegation:
      case TokenType.operatorUnaryAddressOf:
        break;

      case TokenType.ambiguousAsterisk:
        nextTokenType = getNextNonNewlineTokenType(tokens, i);
        previousType = getPrevNonNewlineTokenType(tokens, i);
        if (
          previousType === PrinterCategory.typeOrIdentifier ||
          previousType === TokenType.specialParenthesisClosing
        ) {
          currString = ' *';
        }
        if (
          nextTokenType !== TokenType.ambiguousAsterisk &&
          nextTokenType !== TokenType.specialParenthesisClosing
        ) {
          currString += ' ';
        }
        break;

      case TokenType.operatorUnaryPlus:
      case TokenType.operatorUnaryMinus:
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
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        currString = ` ${currNodeData} `;
        break;

      case TokenType.ambiguousPlus:
      case TokenType.ambiguousMinus:
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        currString = ` ${currNodeData} `;
        break;

      case TokenType.operatorBinaryLogicalAnd:
      case TokenType.operatorBinaryLogicalOr:
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        if (overflow) {
          newline = true;
          currString = ' ' + currString;
          break;
        }
        currString = ` ${currNodeData} `;
        break;

      case TokenType.ambiguousAmpersand:
      case TokenType.ambiguousDecrement:
      case TokenType.ambiguousIncrement:
        break;

      case TokenType.operatorBinaryAssignmentDirect:
        if (context === PrinterCategory.doubleTypeOrIdentifier) {
          context = PrinterCategory.variableDecl;
        }
        currString = ` ${currNodeData} `;
        break;

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
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        currString = ` ${currNodeData} `;
        break;

      case TokenType.operatorMemberSelectionDirect:
      case TokenType.operatorMemberSelectionIndirect:
        if (context === PrinterCategory.typeOrIdentifier) {
          context = null;
        }
        break;

      // Miscellanous operators
      case TokenType.operatorTernaryQuestion:
        currString = ' ? ';
        break;

      case TokenType.ambiguousColon:
        if (
          context === TokenType.keywordCase ||
          context === TokenType.keywordDefault
        ) {
          context = null;
          formattedFileStr += currString;
          previousType = type;
          currString = '\n' + indentation.repeat(blockLevel);
          startLineIndex =
            tokenDecode(tokens[i + 1])[0] - blockLevel * indentation.length;
          continue;
        } else {
          currString = ' : ';
        }
        break;

      // Keywords (https://en.cppreference.com/w/c/keyword)
      case TokenType.keywordIf:
        context = TokenType.keywordIf;
        currString += ' ';
        break;

      case TokenType.keywordElse:
        context = TokenType.keywordElse;
        if (getNextNonNewlineTokenType(tokens, i) !== TokenType.keywordIf) {
          currString = ' else';
        } else {
          currString = ' else ';
        }
        break;

      case TokenType.keywordUnsigned:
      case TokenType.keywordVolatile:
        currString += ' ';
        break;

      case TokenType.keywordShort:
      case TokenType.keywordInt:
      case TokenType.keywordBool:
      case TokenType.keywordFloat:
      case TokenType.keywordDouble:
      case TokenType.keywordChar:
      case TokenType.keywordVoid:
      case TokenType.keywordLong:
        if (context === null) {
          context = PrinterCategory.typeOrIdentifier;
        }
        nextTokenType = getNextNonNewlineTokenType(tokens, i);
        if (
          nextTokenType !== TokenType.specialParenthesisClosing &&
          nextTokenType !== TokenType.ambiguousAsterisk
        ) {
          currString += ' ';
        }
        break;

      case TokenType.keywordSwitch:
        context = TokenType.keywordSwitch;
        currString += ' ';
        break;

      case TokenType.keywordCase:
        context = TokenType.keywordCase;
        previousContext = contextStack.peek();
        currString = `\n${indentation.repeat(previousContext[2] + 1)}case `;
        blockLevel = previousContext[2] + 2;
        break;

      case TokenType.keywordDefault:
        context = TokenType.keywordDefault;
        previousContext = contextStack.peek();
        currString = `\n${indentation.repeat(previousContext[2] + 1)}default`;
        blockLevel = previousContext[2] + 2;
        break;

      case TokenType.keywordReturn:
        if (
          getNextNonNewlineTokenType(tokens, i) !== TokenType.specialSemicolon
        ) {
          currString += ' ';
        }
        break;

      case TokenType.keywordBreak:
      case TokenType.keywordContinue:
        break;

      case TokenType.keywordFor:
        context = TokenType.keywordFor;
        currString += ' ';
        break;

      case TokenType.keywordDo:
        context = TokenType.keywordDo;
        break;

      case TokenType.keywordWhile:
        if (context === TokenType.keywordDo) {
          currString = ' while ';
        } else {
          context = TokenType.keywordWhile;
          currString += ' ';
        }
        break;

      case TokenType.keywordAlignas:
      case TokenType.keywordAlignof:
      case TokenType.keywordAuto:
      case TokenType.keywordAtomic:
      case TokenType.keywordComplex:
      case TokenType.keywordConst:
      case TokenType.keywordExtern:
      case TokenType.keywordGeneric:
      case TokenType.keywordGoto:
      case TokenType.keywordStatic:
      case TokenType.keywordTypedef:
        currString += ' ';
        break;

      case TokenType.keywordEnum:
        context = TokenType.keywordEnum;
        overflow = true;
        currString += ' ';
        break;

      case TokenType.keywordUnion:
      case TokenType.keywordStruct:
        context = TokenType.keywordStruct;
        currString += ' ';
        break;

      // Other
      case TokenType.label:
        const tempLabel = extractStringFromFile(
          fileContents,
          position,
          previousType,
        );
        if (
          contextStack.peek()[0] === TokenType.keywordSwitch &&
          tempLabel === 'default:'
        ) {
          currString =
            '\n' + indentation.repeat(contextStack.peek()[2] + 1) + tempLabel;
        } else {
          currString += tempLabel;
        }
        formattedFileStr += currString;
        previousType = type;
        currString = '\n' + indentation.repeat(blockLevel);
        startLineIndex =
          tokenDecode(tokens[i + 1])[0] - blockLevel * indentation.length;
        continue;

      case TokenType.constantString:
        nextTokenType = getNextNonNewlineTokenType(tokens, i);
        currString += extractStringFromFile(
          fileContents,
          position,
          previousType,
        );
        if (context === PrinterCategory.prepro) {
          newline = true;
          context = null;
        }
        if (nextTokenType === TokenType.identifier) {
          currString += ' ';
        }
        if (previousType === TokenType.identifier) {
          currString = ' ' + currString;
        }
        break;

      case TokenType.constantNumber:
      case TokenType.constantCharacter:
      case TokenType.preproStandardHeader:
        currString += extractStringFromFile(
          fileContents,
          position,
          previousType,
        );
        if (context === PrinterCategory.prepro) {
          newline = true;
          context = null;
        }
        break;

      case TokenType.commentSingleline:
        if (previousType !== null) {
          if (tokenDecode(tokens[i - 1])[1] !== TokenType.newline) {
            currString = ' ';
          } else if (currString === '') {
            currString += ' ';
          }
        }

        currString += extractStringFromFile(
          fileContents,
          position,
          previousType,
        );
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
        currString += extractStringFromFile(
          fileContents,
          position,
          previousType,
        );
        if (tokenDecode(tokens[i + 1])[1] === TokenType.newline) {
          newline = true;
        }
        break;

      case TokenType.identifier:
        currString += extractStringFromFile(
          fileContents,
          position,
          previousType,
        );
        if (context === PrinterCategory.prepro) {
          if (tokenDecode(tokens[i + 1])[1] !== TokenType.newline) {
            currString += ' ';
          } else {
            newline = true;
            context = null;
          }
        } else if (
          getNextNonNewlineTokenType(tokens, i) === TokenType.identifier
        ) {
          currString += ' ';
        } else if (context === PrinterCategory.typeOrIdentifier) {
          context = PrinterCategory.doubleTypeOrIdentifier;
        }
        if (context === null) {
          context = PrinterCategory.typeOrIdentifier;
        }
        break;
    }
    formattedFileStr += currString;
    previousType = type;
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

function extractStringFromFile(
  fileContents: string,
  startIndex: number,
  prevTokenType: TokenType | null,
) {
  return fileContents.slice(
    startIndex,
    tokenFindLastIndex(
      fileContents,
      startIndex,
      tokenDetermineCategory(fileContents.charAt(startIndex), startIndex),
      prevTokenType,
    ) + 1,
  );
}
