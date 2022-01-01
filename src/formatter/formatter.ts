import G = require('glob');
import TokenArray from '../lexer/TokenArray';
import { tokenDecode } from '../lexer/tokenDecode';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import { tokenFindLastIndex } from '../lexer/tokenFindLastIndex';
import TokenType from '../lexer/TokenType';
import checkArrayOverflow from './checkForArrayOverflow';
import checkForLineOverflow from './checkForLineOverflow';
import findEndOfParen from './findClosingParenthesis';
import findEndOfBlock from './findEndOfBlock';
import FormatType from './FormatCategory';
import nextTypeNotNL from './getNextTokenTypeNotNewLine';
import Node, { nodeType } from './Node';
import tokenTypeToValueMap from './tokenTypeToValueMap';

export default function formatFile(tokenizedFile: [string, TokenArray]) {
  // const g = tokenizedFile[1].getValues().slice(0, 10);
  // for (const thing of g) {
  //   console.log(
  //     tokenTypeToValueMap.get(tokenDecode(thing)[1]),
  //     tokenDecode(thing)[1],
  //   );
  // }

  return formatter(
    tokenizedFile[0],
    tokenizedFile[1],
    0,
    tokenizedFile[1].getCount(),
    0,
    null,
    false,
    0,
  );
}

function formatter(
  fileContents: string,
  tokenArray: TokenArray,
  startIndex: number,
  endIndex: number,
  blockLevel: number,
  startingContext: TokenType | FormatType | null,
  startingSplit: boolean,
  startingParenCount: number,
): Node {
  let tokens: Uint32Array = tokenArray.getValues();
  const spacing = '  ';
  const root: nodeType = new Node();
  let currNode: nodeType = root,
    previousType: TokenType | null = null,
    context: TokenType | FormatType | null = startingContext,
    parenCount = startingParenCount,
    nextType: TokenType | FormatType | null,
    newLine = false,
    startLineIndex: number = tokenDecode(tokens[startIndex])[0],
    split: boolean = startingSplit;

  for (let i = startIndex; i < endIndex; ++i) {
    if (currNode) {
      const decodedToken: [number, TokenType] = tokenDecode(tokens[i]);
      const type: TokenType = decodedToken[1];
      const position: number = decodedToken[0];
      const currNodeData = tokenTypeToValueMap.get(type);

      if (currNodeData) {
        currNode.addDataPost(currNodeData);
      }
      if (newLine) {
        currNode.addDataPre(`\n${spacing.repeat(blockLevel)}`);
        if (type === TokenType.newline) {
          if (
            tokenDecode(tokens[i + 1])[1] === TokenType.newline &&
            i + 1 !== endIndex - 1
          ) {
            continue;
          }
        }
        newLine = false;
        startLineIndex = position;
      }
      switch (type) {
        case TokenType.newline:
          continue;

        case TokenType.specialComma:
          if (split || context === TokenType.keywordEnum) {
            newLine = true;
          } else if (parenCount === 0 && context === FormatType.varDec) {
            currNode.addDataPost(`\n${spacing.repeat(blockLevel + 1)}`);
          } else {
            currNode.addDataPost(' ');
          }
          break;

        case TokenType.specialSemicolon:
          if (context === TokenType.keywordFor) {
            currNode.addDataPost(' ');
          } else {
            nextType = nextTypeNotNL(tokens, i, endIndex);
            if (nextType === null) {
              break;
            } else if (
              nextType === TokenType.specialBraceRight ||
              nextType === TokenType.keywordCase ||
              nextType === TokenType.keywordDefault ||
              context === FormatType.singleLineIf
            ) {
              --blockLevel;
              newLine = true;
            } else if (
              tokenDecode(tokens[i + 1])[1] !== TokenType.commentSingleline
            ) {
              newLine = true;
            } else {
              currNode.addDataPost(' ');
            }
            context = null;
          }
          break;

        case TokenType.specialBracketLeft:
        case TokenType.specialBracketRight:
          break;

        case TokenType.specialParenthesisLeft:
          ++parenCount;
          if (checkForLineOverflow(tokens, fileContents, i, startLineIndex)) {
            currNode.addDataPost(`\n${spacing.repeat(blockLevel + 1)}`);
            const endParen = findEndOfParen(tokens, i);
            currNode.setChild(
              formatter(
                fileContents,
                tokenArray,
                i + 1,
                endParen,
                blockLevel + 1,
                null,
                true,
                parenCount + 1,
              ),
            );
            i = endParen - 1;
            newLine = true;
            break;
          } else if (
            context !== FormatType.typeOrIdentifier &&
            context !== TokenType.keywordFor
          ) {
            const endParen = findEndOfParen(tokens, i);
            currNode.setChild(
              formatter(
                fileContents,
                tokenArray,
                i + 1,
                endParen,
                blockLevel,
                null,
                false,
                parenCount + 1,
              ),
            );
            i = endParen - 1;
            break;
          }
          break;

        case TokenType.specialParenthesisRight:
          nextType = nextTypeNotNL(tokens, i, endIndex);
          if (--parenCount === 0) {
            if (context === TokenType.keywordFor) {
              context = null;
            } else if (context === TokenType.keywordIf) {
              if (nextType !== TokenType.specialBraceLeft) {
                ++blockLevel;
                newLine = true;
                context = FormatType.singleLineIf;
              } else {
                context = null;
              }
            }
            if (split) {
              currNode.addDataPre(`\n${spacing.repeat(--blockLevel)}`);
              split = false;
            }
          }
          if (nextType === TokenType.specialBraceLeft) {
            currNode.addDataPost(' ');
          }
          break;

        case TokenType.specialBraceLeft:
          if (context === FormatType.varDec) {
            if (checkArrayOverflow(tokens, i, startLineIndex)) {
              const endSwitch = findEndOfBlock(tokens, i);
              currNode.setChild(
                formatter(
                  fileContents,
                  tokenArray,
                  i + 1,
                  endSwitch,
                  blockLevel + 1,
                  FormatType.varDec,
                  true,
                  1,
                ),
              );
              i = endSwitch - 1;
              currNode.addDataPost(`\n${spacing.repeat(blockLevel + 1)}`);
              newLine = true;
            } else {
              const endSwitch = findEndOfBlock(tokens, i);
              currNode.setChild(
                formatter(
                  fileContents,
                  tokenArray,
                  i + 1,
                  endSwitch + 1,
                  blockLevel,
                  FormatType.varDec,
                  false,
                  1,
                ),
              );
              currNode.addDataPost(' ');
              i = endSwitch;
            }
            break;
          } else if (context === TokenType.keywordEnum) {
            ++blockLevel;
            newLine = true;
            break;
          }
          context = null;
          ++blockLevel;
          newLine = true;
          break;

        case TokenType.specialBraceRight:
          nextType = nextTypeNotNL(tokens, i, endIndex);
          if (context === FormatType.varDec) {
            if (parenCount !== 0) {
              currNode.addDataPre(' ');
            }
          } else if (nextType === TokenType.specialBraceRight) {
            --blockLevel;
            newLine = true;
          } else if (context === TokenType.keywordDo) {
            currNode.addDataPost(' ');
            context = null;
          } else if (context === TokenType.keywordEnum) {
            currNode.addDataPost(' ');
            currNode.addDataPre(`\n${spacing.repeat(--blockLevel)}`);
          } else {
            context = null;
            newLine = true;
          }
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
          context = FormatType.prepro;
          currNode.addDataPost(' ');
          break;

        // Unary operator:
        case TokenType.operatorUnaryArithmeticIncrementPrefix:
        case TokenType.operatorUnaryArithmeticIncrementPostfix:
        case TokenType.operatorUnaryArithmeticDecrementPrefix:
        case TokenType.operatorUnaryArithmeticDecrementPostfix:
        case TokenType.operatorUnaryBitwiseOnesComplement:
        case TokenType.operatorUnaryLogicalNegation:
        case TokenType.operatorUnaryIndirection:
        case TokenType.operatorUnaryAddressOf:
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
          if (context === FormatType.typeOrIdentifier) {
            context = null;
          }
          currNode.setData(` ${currNodeData} `);
          break;

        case TokenType.ambiguousPlus:
        case TokenType.ambiguousMinus:
          if (context === FormatType.typeOrIdentifier) {
            context = null;
          } else if (
            previousType &&
            (previousType < 78 || previousType > 85) &&
            previousType !== TokenType.identifier &&
            previousType !== TokenType.specialParenthesisRight &&
            previousType !== TokenType.specialBraceRight
          ) {
            break;
          }
          currNode.setData(` ${currNodeData} `);
          break;

        case TokenType.operatorBinaryLogicalAnd:
        case TokenType.operatorBinaryLogicalOr:
          if (context === FormatType.typeOrIdentifier) {
            context = null;
          }
          if (split) {
            newLine = true;
            currNode.addDataPre(' ');
            break;
          }
          currNode.setData(` ${currNodeData} `);
          break;

        case TokenType.ambiguousAmpersand:
        case TokenType.ambiguousDecrement:
        case TokenType.ambiguousIncrement:
          break;

        case TokenType.operatorBinaryAssignmentDirect:
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
          currNode.setData(` ${currNodeData} `);
          break;

        case TokenType.operatorMemberSelectionDirect:
        case TokenType.operatorMemberSelectionIndirect:
          if (context === FormatType.typeOrIdentifier) {
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
            ++blockLevel;
            newLine = true;
            context = null;
          } else {
            currNode.setData(' : ');
          }
          break;

        // Keywords (https://en.cppreference.com/w/c/keyword)
        case TokenType.keywordIf:
          context = TokenType.keywordIf;
          currNode.addDataPost(' ');
          break;
        case TokenType.keywordElse:
          currNode.setData(' else ');
          context = TokenType.keywordElse;
          break;

        case TokenType.keywordInt:
        case TokenType.keywordBool:
        case TokenType.keywordFloat:
        case TokenType.keywordDouble:
        case TokenType.keywordChar:
        case TokenType.keywordVoid:
        case TokenType.keywordLong:
          if (context === null) {
            context = FormatType.typeOrIdentifier;
          }
          nextType = nextTypeNotNL(tokens, i, endIndex);
          if (
            nextType !== TokenType.specialParenthesisRight &&
            nextType !== null
          ) {
            currNode.addDataPost(' ');
          }
          break;

        case TokenType.keywordSwitch:
          context = TokenType.keywordSwitch;
          currNode.addDataPost(' ');
          const endSwitch = findEndOfBlock(tokens, i);
          currNode.setChild(
            formatter(
              fileContents,
              tokenArray,
              i + 1,
              endSwitch,
              blockLevel,
              TokenType.keywordSwitch,
              false,
              parenCount,
            ),
          );
          i = endSwitch - 1;
          newLine = true;
          break;

        case TokenType.keywordCase:
          context = TokenType.keywordCase;
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordReturn:
          if (
            nextTypeNotNL(tokens, i, endIndex) !== TokenType.specialSemicolon
          ) {
            currNode.addDataPost(' ');
          }
          break;

        case TokenType.keywordBreak:
        case TokenType.keywordContinue:
          break;

        case TokenType.keywordDefault:
          context = TokenType.keywordDefault;
          break;

        case TokenType.keywordFor:
          context = TokenType.keywordFor;
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordDo:
          context = TokenType.keywordDo;
          currNode.addDataPost(' ');
          const endDoWhile = findEndOfBlock(tokens, i);
          currNode.setChild(
            formatter(
              fileContents,
              tokenArray,
              i + 1,
              endDoWhile,
              blockLevel,
              TokenType.keywordDo,
              false,
              parenCount,
            ),
          );
          i = endDoWhile - 1;
          newLine = true;
          break;

        case TokenType.keywordWhile:
          context = TokenType.keywordWhile;
          currNode.addDataPost(' ');
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
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordEnum:
          context = TokenType.keywordEnum;
          currNode.addDataPost(' ');
          const endEnum = findEndOfBlock(tokens, i);
          currNode.setChild(
            formatter(
              fileContents,
              tokenArray,
              i + 1,
              endEnum + 1,
              blockLevel,
              TokenType.keywordEnum,
              false,
              parenCount,
            ),
          );
          i = endEnum;
          previousType = type;
          currNode.setNext(new Node());
          currNode = currNode.getNext();
          continue;

        case TokenType.keywordStruct:
          context = TokenType.keywordStruct;
          currNode.addDataPost(' ');
          const endStruct = findEndOfBlock(tokens, i);
          currNode.setChild(
            formatter(
              fileContents,
              tokenArray,
              i + 1,
              endStruct + 1,
              blockLevel,
              TokenType.keywordStruct,
              false,
              parenCount,
            ),
          );
          i = endStruct;
          previousType = type;
          currNode.setNext(new Node());
          currNode = currNode.getNext();
          if (
            nextTypeNotNL(tokens, i, endIndex) !== TokenType.specialSemicolon
          ) {
            currNode?.setData(' ');
          }
          continue;

        // Other
        case TokenType.label:
        case TokenType.constantString:
        case TokenType.constantNumber:
        case TokenType.constantCharacter:
        case TokenType.preproStandardHeader:
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          if (context === FormatType.prepro) {
            newLine = true;
            context = null;
          }
          break;

        case TokenType.commentSingleline:
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          if (tokenDecode(tokens[i + 1])[1] === TokenType.newline) {
            newLine = true;
          }
          nextType = nextTypeNotNL(tokens, i, endIndex);
          if (
            nextType === TokenType.specialBraceRight ||
            nextType === TokenType.keywordCase ||
            nextType === TokenType.keywordDefault ||
            context === FormatType.singleLineIf
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

          const nextTokenType = nextTypeNotNL(tokens, i, endIndex);

          if (
            nextTokenType === TokenType.identifier ||
            nextTokenType === TokenType.ambiguousAsterisk
          ) {
            currNode.addDataPost(' ');
          }
          if (context === FormatType.prepro) {
            if (nextTokenType !== FormatType.prepro) {
              currNode.addDataPost(' ');
            } else {
              newLine = true;
            }
          } else if (context === null) {
            if (nextTokenType === TokenType.specialParenthesisLeft) {
              context = FormatType.funcCall;
            } else {
              context = FormatType.typeOrIdentifier;
            }
          } else if (context === FormatType.typeOrIdentifier) {
            if (
              nextTokenType === FormatType.assignment ||
              nextTokenType === TokenType.specialComma ||
              nextTokenType === TokenType.specialBracketLeft
            ) {
              context = FormatType.varDec;
            } else if (nextTokenType === TokenType.specialParenthesisLeft) {
              context = FormatType.funcDec;
            }
          }
          break;
      }

      previousType = type;
      currNode.setNext(new Node());
      currNode = currNode.getNext();
    }
  }
  return root;
}

export function toString(currNode: nodeType) {
  let str: string = '';

  if (currNode?.getData()) {
    str += currNode.getData();
    if (currNode.getChild()) {
      str += toString(currNode.getChild());
    }
    if (currNode.getNext()) {
      str += toString(currNode.getNext());
    }
  }
  return str;
}

function setNodesDataFromFileContent(
  currNode: Node,
  fileContents: string,
  position: number,
  previousType: TokenType | null,
) {
  currNode.addDataPost(
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
