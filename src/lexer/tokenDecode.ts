import TokenType from './TokenType';

/**
 * Extracts the start index and type from an encoded token.
 * @param token The encoded token to decode.
 * @returns The start index and the token type as an array of 2 elements.
 */
export default function tokenDecode(token: number): [number, TokenType] {
  const extractedStartIndex = (token & 0xfffffff80) >>> 7; // extract leftmost 25 bits
  const extractedType = token & 0x0000007f; // extract rightmost 7 bits
  return [extractedStartIndex, extractedType];
}
