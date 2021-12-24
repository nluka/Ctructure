import TokenArray from '../lexer/TokenArray';
import { tokenDecode } from '../lexer/tokenDecode';
import TokenType from '../lexer/TokenType';
import findEndOfSwitch from './findEndOfSwitch';
import Node, { nodeType } from './node';
import tokenTypeToValueMap from './tokenTypeToValueMap';

export default function formatFile(tokenizedFile: TokenArray) {
  tokenizedFile.slice(0, tokenizedFile.getCount());
  return formatter(tokenizedFile.slice(0, tokenizedFile.getCount()), 0);
}

function formatter(tokenizedFile: Uint32Array, blockLevel: number): Node {
  const spacing = '  ';
  const root: nodeType = new Node();
  let currNode: nodeType = root;
  let previousType: TokenType | null = null;
  let previousGenericType: Type | null = null;
  let context: TokenType | null = null;
  let genericContext: Type | null = null;
  let parenCount = 0;
  for (let index = 0; index < tokenizedFile.length; ++index) {
    if (currNode) {
      const decodedToken: [number, TokenType] = tokenDecode(
        tokenizedFile[index],
      );
      const type: TokenType = decodedToken[1];
      let currNodeData = tokenTypeToValueMap.get(type);
      if (currNodeData === undefined) {
        currNodeData = '';
      }
      currNode.setData(tokenTypeToValueMap.get(type));

      switch (type) {
        case TokenType.specialComma:
          if (genericContext === Type.varDec) {
            genericContext = Type.multiVarDec;
            ++blockLevel;
            break;
          } else if (genericContext === Type.multiVarDec) {
            break;
          }
          currNode.addDataPost(' ');
          break;
        case TokenType.specialSemicolon:
          if (genericContext === Type.singleLineIf) {
            currNode.addDataPost('\n');
          }
          genericContext = null;
          break;
        case TokenType.specialBracketLeft:
        case TokenType.specialBracketRight:
          break;
        case TokenType.specialParenthesisLeft:
          if (
            context === TokenType.keywordIf ||
            context === TokenType.keywordFor
          ) {
            ++parenCount;
          } else if (genericContext === Type.varDec) {
            genericContext = Type.funcDec;
          }
          break;
        case TokenType.specialParenthesisRight:
          if (context === TokenType.keywordIf) {
            --parenCount;
            if (
              parenCount === 0 &&
              tokenDecode(tokenizedFile[index + 1])[1] !==
                TokenType.specialBraceLeft
            ) {
              currNode.addDataPost(`\n${spacing.repeat(blockLevel + 1)}`);
              genericContext = Type.singleLineIf;
            }
          }
          break;
        case TokenType.specialBraceLeft:
          if (genericContext === Type.varDec) {
            currNode.addDataPost(' ');
            break;
          }
          ++blockLevel;
          if (previousType === TokenType.specialParenthesisRight) {
            currNode.setData(' {\n' + spacing.repeat(blockLevel));
          } else if (
            previousType === TokenType.keywordElse ||
            previousType === TokenType.keywordDo
          ) {
            currNode.setData('{\n' + spacing.repeat(blockLevel));
          }
          context = null;
          break;
        case TokenType.specialBraceRight:
          if (context === TokenType.keywordSwitch) {
            currNode.setData(`\n${spacing.repeat(blockLevel)}}`);
          } else if (genericContext === Type.varDec) {
            currNode.addDataPre(' ');
            break;
          }
          --blockLevel;
          break;

        // Preprocessor (https://www.cprogramming.com/reference/preprocessor/)
        case TokenType.preproOperatorConcat:
        case TokenType.preproDirectiveInclude:
        case TokenType.preproStandardHeader:
        case TokenType.preproDirectiveDefine:
        case TokenType.preproLineContinuation:
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
          previousGenericType = Type.prepro;
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
        case TokenType.operatorUnaryDereference:
          previousGenericType = Type.operatorUnary;
          break;
        //Binary operators
        case TokenType.operatorBinaryArithmeticMultiplication:
        case TokenType.operatorBinaryArithmeticAddition:
        case TokenType.operatorBinaryArithmeticSubtraction:
        case TokenType.operatorBinaryArithmeticDivision:
        case TokenType.operatorBinaryArithmeticMultiplication:
        case TokenType.operatorBinaryComparisonEqualTo:
        case TokenType.operatorBinaryComparisonNotEqualTo:
        case TokenType.operatorBinaryComparisonGreaterThan:
        case TokenType.operatorBinaryComparisonGreaterThanOrEqualTo:
        case TokenType.operatorBinaryComparisonLessThan:
        case TokenType.operatorBinaryComparisonLessThanOrEqualTo:
        case TokenType.operatorBinaryLogicalAnd:
        case TokenType.operatorBinaryLogicalOr:
        case TokenType.operatorBinaryBitwiseAnd:
        case TokenType.operatorBinaryBitwiseOr:
        case TokenType.operatorBinaryBitwiseXor:
        case TokenType.operatorBinaryBitwiseShiftLeft:
        case TokenType.operatorBinaryBitwiseShiftRight:
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
          if (genericContext === Type.varDec) {
            currNode.setData(` ${tokenTypeToValueMap.get(type)} `);
            break;
          } else if (previousGenericType !== Type.keyword) {
            currNode.setData(` ${tokenTypeToValueMap.get(type)} `);
          }
          previousGenericType = Type.operatorBinary;
          break;

        case TokenType.operatorMemberSelectionDirect:
        case TokenType.operatorMemberSelectionIndirect:
          break;

        //Miscellanous operators
        case TokenType.operatorTernaryQuestion:
          break;

        case TokenType.operatorTernaryColon:
          if (context === TokenType.keywordCase) {
            ++blockLevel;
            currNode.addDataPost(`\n${spacing.repeat(blockLevel)}`);
          }
          break;

        //Constants
        case TokenType.constantNumber:
          currNode.setData('0');
          break;
        case TokenType.constantCharacter:
          currNode.setData("'J'");
          break;
        case TokenType.constantString:
          currNode.setData('"hello"');
          break;

        //Keywords (https://en.cppreference.com/w/c/keyword)
        case TokenType.keywordIf:
          context = TokenType.keywordIf;
          previousGenericType = Type.keyword;
          currNode.addDataPost(' ');
          break;
        case TokenType.keywordElse:
          currNode.setData(' else ');
          context = TokenType.keywordIf;
          break;

        case TokenType.keywordInt:
        case TokenType.keywordBool:
        case TokenType.keywordFloat:
        case TokenType.keywordDouble:
        case TokenType.keywordChar:
          if (genericContext !== Type.funcDec) {
            genericContext = Type.varDec;
          }
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordSwitch:
          context = TokenType.keywordSwitch;
          currNode.addDataPost(' ');
          const endSwitch = findEndOfSwitch(tokenizedFile, index);
          currNode.setChild(
            formatter(tokenizedFile.slice(index + 1, endSwitch), blockLevel),
          );
          index = endSwitch - 1;
          break;

        case TokenType.keywordCase:
          context = TokenType.keywordCase;
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordReturn:
          if (
            tokenDecode(tokenizedFile[index + 1])[1] !==
            TokenType.specialSemicolon
          ) {
            currNode.addDataPost(' ');
          }
          break;

        case TokenType.keywordBreak:
        case TokenType.keywordDefault:
        case TokenType.keywordContinue:
          break;

        case TokenType.keywordFor:
          context = TokenType.keywordFor;
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordWhile:
        case TokenType.keywordDo:
        case TokenType.keywordAlignas:
        case TokenType.keywordAlignof:
        case TokenType.keywordAuto:
        case TokenType.keywordAtomic:
        case TokenType.keywordComplex:
        case TokenType.keywordConst:
        case TokenType.keywordEnum:
        case TokenType.keywordExtern:
        case TokenType.keywordGeneric:
        case TokenType.keywordGoto:
          previousGenericType = Type.keyword;
          currNode.addDataPost(' ');
          break;

        //Other
        case TokenType.identifier:
          currNode.setData('thing');
          if (previousGenericType === Type.prepro) {
            currNode.addDataPost('\n');
          } else if (previousType === TokenType.label) {
            currNode.addDataPre(' ');
          }
          previousGenericType = null;
          break;
        case TokenType.label:
          currNode.setData('type');
          break;
      }

      //add new line with proper indentation

      if (
        previousType === TokenType.specialSemicolon ||
        (previousType === TokenType.specialBraceRight &&
          type !== TokenType.specialSemicolon &&
          type !== TokenType.keywordElse) ||
        (genericContext === Type.multiVarDec &&
          previousType === TokenType.specialComma)
      ) {
        if (context === TokenType.keywordFor) {
          currNode.addDataPre(' ');
        } else {
          currNode.addDataPre(`\n${spacing.repeat(blockLevel)}`);
        }
      }

      if (type === TokenType.keywordBreak) {
        --blockLevel;
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

enum Type {
  prepro,
  operatorBinary,
  operatorUnary,
  special,
  keyword,
  varDec,
  multiVarDec,
  funcDec,
  singleLineIf,
}
