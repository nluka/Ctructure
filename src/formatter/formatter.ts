import TokenArray from '../lexer/TokenArray';
import { tokenDecode } from '../lexer/tokenDecode';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import { tokenFindLastIndex } from '../lexer/tokenFindLastIndex';
import TokenType from '../lexer/TokenType';
import tokenTypeToNameMap from '../lexer/tokenTypeToNameMap';
import checkForLineOverflow from './checkForLineOverflow';
import FormatCategory from './FormatCategory';
import nextTypeNotNL from './getNextTokenTypeNotNewLine';
import getPrevTokenTypeNotNewLine from './getPreviousTypeNotNewLine';
import NodeString from './NodeString';
import Stack from './Stack';
import tokenTypeToValueMap from './tokenTypeToValueMap';

export default function formatFile(lexer: [string, TokenArray]): string {
  return formatter(lexer[0], lexer[1], 2);
}

/**
 * @param fileContents contents of the file in string form.
 * @param tokenArray tokenized file
 * @param spaceAmount set by user. number of spaces between block levels
 * @var indentation based on spaceAmount, string literal of block level indentation
 * @var overflow if true (due to line overflow), the line will split where it's appropriate.\
 *  only used within parentheses, arrays and multi variable declarations
 * @var newLine when set to true, a new line will be added to the next token
 * @var blockLevel level of indentation
 * @var parenCount depth of parentheses
 * @var currNode the current node
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
  const root: NodeString = new NodeString();
  const tokens: Uint32Array = tokenArray.getValues();
  let overflow: boolean = false,
    newLine: boolean = false,
    blockLevel: number = 0,
    parenCount = 0,
    currNode: NodeString | null = root,
    nextType: Types,
    previousType: Types = null,
    context: Types = null,
    contextStack: Stack = new Stack(),
    previousContext: [Types, boolean, number] | null = null,
    startLineIndex: number = tokenDecode(tokens[0])[0],
    formattedFileStr: string = '';

  for (let i = 0; i < tokenArray.getCount(); ++i) {
    if (currNode) {
      const decodedToken: [number, TokenType] = tokenDecode(tokens[i]);
      const type: TokenType = decodedToken[1];
      const position: number = decodedToken[0];
      const currNodeData = tokenTypeToValueMap.get(type);

      if (currNodeData) {
        currNode.setData(currNode.getData() + currNodeData);
      }

      if (newLine && type !== TokenType.commentSingleline) {
        currNode.setData(
          `\n${indentation.repeat(blockLevel)}` + currNode.getData(),
        );
        if (type === TokenType.newline) {
          if (tokenDecode(tokens[i + 1])[1] === TokenType.newline) {
            continue;
          }
        }
        newLine = false;
        startLineIndex = position - blockLevel * indentation.length;
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
            currNode.setData(', ');
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
            currNode.setData('; ');
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
            currNode.setData(
              currNode.getData() + `\n${indentation.repeat(++blockLevel)}`,
            );
          }
          break;
        case TokenType.specialBracketClosing:
          previousContext = contextStack.pop();
          blockLevel = previousContext[2];
          if (overflow) {
            currNode.setData(
              `\n${indentation.repeat(blockLevel)}` + currNode.getData(),
            );
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
          if (overflow) {
            currNode.setData(
              `\n${indentation.repeat(--blockLevel)}` + currNode.getData(),
            );
            startLineIndex = position;
          }

          previousContext = contextStack.pop();
          if (previousContext[0] === TokenType.keywordFor && parenCount === 0) {
            context = null;
          } else {
            context = previousContext[0];
          }
          overflow = previousContext[1];
          blockLevel = previousContext[2];

          nextType = nextTypeNotNL(tokens, i);
          if (
            context === TokenType.keywordIf &&
            nextType !== TokenType.specialBraceOpening
          ) {
            newLine = true;
            ++blockLevel;
            context = FormatCategory.singleLineIf;
          }
          break;

        case TokenType.specialBraceOpening:
          if (context === TokenType.keywordIf) {
            context = null;
          }
          contextStack.push([context, overflow, blockLevel]);
          if (
            context === FormatCategory.varDec ||
            context === FormatCategory.multiVarDec ||
            context === FormatCategory.array
          ) {
            context = FormatCategory.array;
            overflow = checkForLineOverflow(
              fileContents,
              context,
              tokens,
              i,
              position,
            );
            if (overflow) {
              newLine = true;
              ++blockLevel;
            } else {
              currNode.setData(currNode.getData() + ' ');
            }
            break;
          }
          ++blockLevel;
          newLine = true;
          currNode.setData(' ' + currNode.getData());
          break;

        case TokenType.specialBraceClosing:
          previousContext = contextStack.pop();
          blockLevel = previousContext[2];
          if (context === FormatCategory.array) {
            if (!overflow) {
              currNode.setData(` }`);
            } else {
              currNode.setData(`\n${indentation.repeat(blockLevel)}}`);
            }
            context = previousContext[0];
            overflow = previousContext[1];
            break;
          }
          context = previousContext[0];
          overflow = previousContext[1];
          currNode.setData(`\n${indentation.repeat(blockLevel)}}`);
          if (
            context === TokenType.keywordEnum ||
            context === TokenType.keywordStruct ||
            context === TokenType.keywordDo
          ) {
            nextType = nextTypeNotNL(tokens, i);
            if (nextType !== TokenType.specialSemicolon) {
              currNode.setData(currNode.getData() + ' ');
            }
          } else {
            newLine = true;
          }
          context = null;
          break;

        // Preprocessor (https://www.cprogramming.com/reference/preprocessor/)
        case TokenType.preproOperatorConcat:
        case TokenType.preproDirectiveInclude:
        case TokenType.preproDirectiveDefine:
        case TokenType.preproLineContinuation:
        case TokenType.preproDirectiveUndef:
        case TokenType.preproDirectiveIf:
        case TokenType.preproDirectiveIfdef:
        case TokenType.preproDirectiveIfndef:
        case TokenType.preproDirectiveEndif:
        case TokenType.preproMacroFile:
        case TokenType.preproMacroLine:
        case TokenType.preproMacroDate:
        case TokenType.preproMacroTime:
        case TokenType.preproMacroTimestamp:
        case TokenType.preproDirectivePragma:
          context = FormatCategory.prepro;
          currNode.setData(currNode.getData() + ' ');
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
          if (
            getPrevTokenTypeNotNewLine(tokens, i) ===
            FormatCategory.typeOrIdentifier
          ) {
            currNode.setData(' *');
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
          currNode.setData(` ${currNodeData} `);
          break;

        case TokenType.ambiguousPlus:
        case TokenType.ambiguousMinus:
          if (context === FormatCategory.typeOrIdentifier) {
            context = null;
          }
          currNode.setData(` ${currNodeData} `);
          break;

        case TokenType.operatorBinaryLogicalAnd:
        case TokenType.operatorBinaryLogicalOr:
          if (context === FormatCategory.typeOrIdentifier) {
            context = null;
          }
          if (overflow) {
            newLine = true;
            currNode.setData(' ' + currNode.getData());
            break;
          }
          currNode.setData(` ${currNodeData} `);
          break;

        case TokenType.ambiguousAmpersand:
        case TokenType.ambiguousDecrement:
        case TokenType.ambiguousIncrement:
          break;

        case TokenType.operatorBinaryAssignmentDirect:
          if (context === FormatCategory.doubleTypeorIdentifier) {
            context = FormatCategory.varDec;
          }
          currNode.setData(` ${currNodeData} `);
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
          currNode.setData(` ${currNodeData} `);
          break;

        case TokenType.operatorMemberSelectionDirect:
        case TokenType.operatorMemberSelectionIndirect:
          if (context === FormatCategory.typeOrIdentifier) {
            context = null;
          }
          break;

        // Miscellanous operators
        case TokenType.operatorTernaryQuestion:
          currNode.setData(' ? ');
          break;

        case TokenType.operatorTernaryColon:
          if (
            context === TokenType.keywordCase ||
            context === TokenType.keywordDefault
          ) {
            newLine = true;
            context = null;
          } else {
            currNode.setData(' : ');
          }
          break;

        // Keywords (https://en.cppreference.com/w/c/keyword)
        case TokenType.keywordIf:
          context = TokenType.keywordIf;
          currNode.setData(currNode.getData() + ' ');
          break;
        case TokenType.keywordElse:
          context = TokenType.keywordElse;
          if (nextTypeNotNL(tokens, i) !== TokenType.keywordIf) {
            currNode.setData(' else');
          } else {
            currNode.setData(' else ');
          }
          break;

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
          nextType = nextTypeNotNL(tokens, i);
          if (
            nextType !== TokenType.specialParenthesisClosing &&
            nextType !== TokenType.operatorUnaryIndirection
          ) {
            currNode.setData(currNode.getData() + ' ');
          }

          break;

        case TokenType.keywordSwitch:
          context = TokenType.keywordSwitch;
          currNode.setData(currNode.getData() + ' ');
          break;

        case TokenType.keywordCase:
          context = TokenType.keywordCase;
          previousContext = contextStack.peek();
          currNode.setData(
            `\n${indentation.repeat(previousContext[2] + 1)}case `,
          );
          blockLevel = previousContext[2] + 2;
          break;
        case TokenType.keywordDefault:
          context = TokenType.keywordDefault;
          previousContext = contextStack.peek();
          currNode.setData(
            `\n${indentation.repeat(previousContext[2] + 1)}default`,
          );
          blockLevel = previousContext[2] + 2;
          break;

        case TokenType.keywordReturn:
          if (nextTypeNotNL(tokens, i) !== TokenType.specialSemicolon) {
            currNode.setData(currNode.getData() + ' ');
          }
          break;

        case TokenType.keywordBreak:
        case TokenType.keywordContinue:
          break;

        case TokenType.keywordFor:
          context = TokenType.keywordFor;
          currNode.setData(currNode.getData() + ' ');
          break;

        case TokenType.keywordDo:
          context = TokenType.keywordDo;
          break;

        case TokenType.keywordWhile:
          if (context === TokenType.keywordDo) {
            currNode.setData(' while ');
          } else {
            context = TokenType.keywordWhile;
            currNode.setData(currNode.getData() + ' ');
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
          currNode.setData(currNode.getData() + ' ');
          break;

        case TokenType.keywordEnum:
          context = TokenType.keywordEnum;
          overflow = true;
          currNode.setData(currNode.getData() + ' ');
          break;

        case TokenType.keywordUnion:
        case TokenType.keywordStruct:
          context = TokenType.keywordStruct;
          currNode.setData(currNode.getData() + ' ');
          break;

        // Other
        case TokenType.label:
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          newLine = true;
          break;
        case TokenType.constantString:
          nextType = nextTypeNotNL(tokens, i);
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          if (context === FormatCategory.prepro) {
            newLine = true;
            context = null;
          }
          if (nextType === TokenType.identifier) {
            currNode.setData(currNode.getData() + ' ');
          }
          if (previousType === TokenType.identifier) {
            currNode.setData(' ' + currNode.getData());
          }
          break;
        case TokenType.constantNumber:
        case TokenType.constantCharacter:
        case TokenType.preproStandardHeader:
          setNodesDataFromFileContent(
            currNode,
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
          if (
            previousType !== null &&
            currNode.getData() === '' &&
            context !== FormatCategory.prepro
          ) {
            currNode.setData(' ');
          }
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          if (tokenDecode(tokens[i + 1])[1] === TokenType.newline) {
            newLine = true;
          }
          nextType = nextTypeNotNL(tokens, i);
          if (
            nextType === TokenType.specialBraceClosing ||
            nextType === TokenType.keywordCase ||
            nextType === TokenType.keywordDefault
          ) {
            --blockLevel;
          }
          break;

        case TokenType.commentMultiline:
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          newLine = true;
          break;

        case TokenType.identifier:
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );

          nextType = nextTypeNotNL(tokens, i);
          if (
            context === FormatCategory.varDec ||
            context === FormatCategory.multiVarDec
          ) {
            break;
          }

          if (context === FormatCategory.prepro) {
            if (tokenDecode(tokens[i + 1])[1] !== TokenType.newline) {
              currNode.setData(currNode.getData() + ' ');
              break;
            }
            newLine = true;
          } else if (nextType === TokenType.identifier) {
            currNode.setData(currNode.getData() + ' ');
          } else if (context === FormatCategory.typeOrIdentifier) {
            context = FormatCategory.doubleTypeorIdentifier;
          }
          if (context === null) {
            context = FormatCategory.typeOrIdentifier;
          }
          break;
      }
      formattedFileStr += currNode.getData();
      previousType = type;
      currNode.setData('');
    }
  }

  if (
    tokenDecode(tokens[tokenArray.getCount() - 1])[1] === TokenType.newline &&
    formattedFileStr !== ''
  ) {
    formattedFileStr += '\n';
  }
  return formattedFileStr;
}

function setNodesDataFromFileContent(
  currNode: NodeString,
  fileContents: string,
  position: number,
  previousType: TokenType | null,
) {
  currNode.setData(
    currNode.getData() +
      fileContents.slice(
        position,
        tokenFindLastIndex(
          fileContents,
          position,
          tokenDetermineCategory(fileContents.charAt(position), position),
          previousType,
        ) + 1,
      ),
  );
}
