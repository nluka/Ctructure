import { TokenTypeOverflowable } from './printer';

export default function whichOccursFirst(
  tokTypes: Uint8Array,
  index: number,
  tokTypeOne: TokenTypeOverflowable,
  tokTypeTwo: TokenTypeOverflowable,
): TokenTypeOverflowable {
  for (let i = index; i < tokTypes.length; ++i) {
    if (tokTypes[i] === tokTypeOne) {
      return tokTypeOne;
    }
    if (tokTypes[i] === tokTypeTwo) {
      return tokTypeTwo;
    }
  }
  return tokTypeTwo;
}
