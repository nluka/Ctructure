import TokenArray from '../lexer/TokenArray';
import { tokenDecode } from '../lexer/tokenDecode';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import { tokenFindLastIndex } from '../lexer/tokenFindLastIndex';
import TokenType from '../lexer/TokenType';
import checkForLineOverflow from './checkForLineOverflow';
import FormatCategory from './FormatCategory';
import nextTypeNotNewline from './getNextTypeNotNewline';
import prevTypeNotNewline from './getPreviousTypeNotNewline';
import Stack from './Stack';
import tokenTypeToValueMap from './tokenTypeToValueMap';

export default function formatFile(lexer: [string, TokenArray]): string {
  return formatter(lexer[0], lexer[1], 2);
}

/**
 * @param fileContents contents of the file in string form.
 * @param tokenArray tokenized file
 * @param spaceAmount set by user. number of spaces between block levels
 * @var indentation based on spaceAmount, string of block level indentation
 * @var overflow if true (due to line overflow), the line will split where it's appropriate.\
 *  only used within parentheses, arrays and multi variable declarations
 * @var newLine when set to true, a new line will be added to the next token
 * @var blockLevel level of indentation
 * @var parenCount depth of parentheses
 * @var currString used to alter the current string before adding to the final string
 * @var nextType holds the next token's type, skipping new line tokens
 * @var previousType the previous token type
 * @var context used to determine how a token should behave
 * @var contextStack stores the previous context when opening parentheses, braces, or brackets are present
 * @var previousContext holds the popped context, used when closing parentheses, braces, or brackets are present
 * @var startLineIndex used in determining if there is line overflow

 * @returns root node.
 */
export type Types = TokenType | FormatCategory | null;

function formatter(
  fileContents: string,
  tokenArray: TokenArray,
  spaceAmount: number,
): string {
  const indentation = ' '.repeat(spaceAmount);
  const tokens: Uint32Array = tokenArray.getValues();
  let overflow: boolean = false,
    newLine: boolean = false,
    blockLevel: number = 0,
    parenCount = 0,
    currString: string = '',
    nextType: Types,
    previousType: Types = null,
    context: Types = null,
    contextStack: Stack = new Stack(),
    previousContext: [Types, boolean, number] | null = null,
    startLineIndex: number = tokenDecode(tokens[0])[0],
    formattedFileStr: string = '';

  for (
    let i = 0;
    i < tokenArray.getCount();
    ++i, nextType = nextTypeNotNewline(tokens, i)
  ) {
    const [position, type] = tokenDecode(tokens[i]);
    const currNodeData = tokenTypeToValueMap.get(type);

    if (currNodeData) {
      currString += currNodeData;
    }
    if (newLine) {
      if (type !== TokenType.commentSingleline) {
        currString = '\n' + indentation.repeat(blockLevel) + currString;
        if (
          type === TokenType.newline &&
          tokenDecode(tokens[i + 1])[1] === TokenType.newline
        ) {
          currString = '\n' + indentation.repeat(blockLevel) + currString;
        }
        newLine = false;
        startLineIndex = position - blockLevel * indentation.length;
      }
    }

    switch (type) {
      case TokenType.newline:
        continue;

      case TokenType.specialComma:
        if (context === FormatCategory.multiVarDec || overflow) {
          newLine = true;
        } else if (
          context === FormatCategory.varDec ||
          context === FormatCategory.doubleTypeorIdentifier
        ) {
          newLine = true;
          ++blockLevel;
          context = FormatCategory.multiVarDec;
        } else {
          currString = ', ';
        }
        break;

      case TokenType.specialSemicolon:
        if (
          context === FormatCategory.multiVarDec ||
          context === FormatCategory.singleLineIf
        ) {
          --blockLevel;
          newLine = true;
          context = null;
        } else if (context === FormatCategory.varDec) {
          newLine = true;
          context = null;
        } else if (context === TokenType.keywordFor) {
          currString = '; ';
        } else {
          overflow = false;
          newLine = true;
        }
        break;

      case TokenType.specialBracketOpening:
        contextStack.push([context, overflow, blockLevel]);
        if (context === FormatCategory.doubleTypeorIdentifier) {
          context = FormatCategory.varDec;
        }
        overflow = checkForLineOverflow(
          fileContents,
          TokenType.specialBracketOpening,
          tokens,
          i,
          startLineIndex,
        );
        if (overflow) {
          ++blockLevel;
          newLine = true;
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
        if (context === FormatCategory.doubleTypeorIdentifier) {
          context = FormatCategory.funcDec;
        } else if (previousType === TokenType.identifier) {
          context = FormatCategory.funcCall;
        } else if (context !== TokenType.keywordFor) {
          context = null;
        }
        overflow = checkForLineOverflow(
          fileContents,
          context,
          tokens,
          i,
          startLineIndex,
        );
        if (overflow) {
          newLine = true;
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
        nextType = nextTypeNotNewline(tokens, i);
        if (context === TokenType.keywordIf) {
          if (nextType !== TokenType.specialBraceOpening) {
            context = FormatCategory.singleLineIf;
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
          context === FormatCategory.varDec ||
          context === FormatCategory.multiVarDec ||
          context === FormatCategory.array
        ) {
          context = FormatCategory.array;
          overflow = checkForLineOverflow(
            fileContents,
            FormatCategory.array,
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
        if (context === FormatCategory.array) {
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
            if (nextTypeNotNewline(tokens, i) !== TokenType.specialSemicolon) {
              currString += ' ';
            }
          } else {
            newLine = true;
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
        context = FormatCategory.prepro;
        currString += ' ';
        break;

      case TokenType.preproLineContinuation:
        newLine = true;
        break;

      case TokenType.preproDirectiveEndif:
        context = FormatCategory.prepro;
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

      case TokenType.operatorUnaryIndirection:
      case TokenType.ambiguousAsterisk:
        nextType = nextTypeNotNewline(tokens, i);
        previousType = prevTypeNotNewline(tokens, i);
        if (
          previousType === FormatCategory.typeOrIdentifier ||
          previousType === TokenType.specialParenthesisClosing
        ) {
          currString = ' *';
        }
        if (
          nextType !== TokenType.ambiguousAsterisk &&
          nextType !== TokenType.operatorUnaryIndirection &&
          nextType !== TokenType.specialParenthesisClosing
        ) {
          currString += ' ';
        }
        break;

      case TokenType.operatorUnaryPlus:
      case TokenType.operatorUnaryMinus:
        break;

      // Binary operators
      case TokenType.operatorBinaryArithmeticMultiplication:
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
        if (context === FormatCategory.typeOrIdentifier) {
          context = null;
        }
        currString = ` ${currNodeData} `;
        break;

      case TokenType.ambiguousPlus:
      case TokenType.ambiguousMinus:
        if (context === FormatCategory.typeOrIdentifier) {
          context = null;
        }
        currString = ` ${currNodeData} `;
        break;

      case TokenType.operatorBinaryLogicalAnd:
      case TokenType.operatorBinaryLogicalOr:
        if (context === FormatCategory.typeOrIdentifier) {
          context = null;
        }
        if (overflow) {
          newLine = true;
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
        if (context === FormatCategory.doubleTypeorIdentifier) {
          context = FormatCategory.varDec;
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
        if (context === FormatCategory.typeOrIdentifier) {
          context = null;
        }
        currString = ` ${currNodeData} `;
        break;

      case TokenType.operatorMemberSelectionDirect:
      case TokenType.operatorMemberSelectionIndirect:
        if (context === FormatCategory.typeOrIdentifier) {
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
        if (nextTypeNotNewline(tokens, i) !== TokenType.keywordIf) {
          currString = ' else';
        } else {
          currString = ' else ';
        }
        break;

      case TokenType.keywordUnsigned:
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
          context = FormatCategory.typeOrIdentifier;
        }
        nextType = nextTypeNotNewline(tokens, i);
        if (
          nextType !== TokenType.specialParenthesisClosing &&
          nextType !== TokenType.operatorUnaryIndirection
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
        if (nextTypeNotNewline(tokens, i) !== TokenType.specialSemicolon) {
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
        const tempLabel = getDataFromFileContent(
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
        nextType = nextTypeNotNewline(tokens, i);
        currString += getDataFromFileContent(
          fileContents,
          position,
          previousType,
        );
        if (context === FormatCategory.prepro) {
          newLine = true;
          context = null;
        }
        if (nextType === TokenType.identifier) {
          currString += ' ';
        }
        if (previousType === TokenType.identifier) {
          currString = ' ' + currString;
        }
        break;

      case TokenType.constantNumber:
      case TokenType.constantCharacter:
      case TokenType.preproStandardHeader:
        currString += getDataFromFileContent(
          fileContents,
          position,
          previousType,
        );
        if (context === FormatCategory.prepro) {
          newLine = true;
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

        currString += getDataFromFileContent(
          fileContents,
          position,
          previousType,
        );
        if (tokenDecode(tokens[i + 1])[1] === TokenType.newline) {
          newLine = true;
        }
        nextType = nextTypeNotNewline(tokens, i);
        if (
          nextType === TokenType.specialBraceClosing ||
          nextType === TokenType.keywordCase ||
          nextType === TokenType.keywordDefault
        ) {
          --blockLevel;
        }
        break;

      case TokenType.commentMultiline:
        currString += getDataFromFileContent(
          fileContents,
          position,
          previousType,
        );
        if (tokenDecode(tokens[i + 1])[1] === TokenType.newline) {
          newLine = true;
        }
        break;

      case TokenType.identifier:
        currString += getDataFromFileContent(
          fileContents,
          position,
          previousType,
        );
        if (context === FormatCategory.prepro) {
          if (tokenDecode(tokens[i + 1])[1] !== TokenType.newline) {
            currString += ' ';
          } else {
            newLine = true;
            context = null;
          }
        } else if (nextTypeNotNewline(tokens, i) === TokenType.identifier) {
          currString += ' ';
        } else if (context === FormatCategory.typeOrIdentifier) {
          context = FormatCategory.doubleTypeorIdentifier;
        }
        if (context === null) {
          context = FormatCategory.typeOrIdentifier;
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

function getDataFromFileContent(
  fileContents: string,
  position: number,
  previousType: TokenType | null,
) {
  return fileContents.slice(
    position,
    tokenFindLastIndex(
      fileContents,
      position,
      tokenDetermineCategory(fileContents.charAt(position), position),
      previousType,
    ) + 1,
  );
}
