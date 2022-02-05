import { OverflowableContext } from './printer';

export default function whichOccursFirst(
  tokenTypes: Uint8Array,
  index: number,
  tokenTypeOne: OverflowableContext,
  tokenTypeTwo: OverflowableContext,
): OverflowableContext {
  for (let i = index; i < tokenTypes.length; ++i) {
    if (tokenTypes[i] === tokenTypeOne) {
      return tokenTypeOne;
    }
    if (tokenTypes[i] === tokenTypeTwo) {
      return tokenTypeTwo;
    }
  }
  return tokenTypeTwo;
}
