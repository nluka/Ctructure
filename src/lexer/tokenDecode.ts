import TokenType from './TokenType';

/**
 * Extracts the start index and type from an encoded token.
 * @param token The encoded token to decode.
 * @returns The start index and the token type as an array of 2 elements.
 */
export function tokenDecode(token: number): [number, TokenType] {
  const extractedStartIndex = (token & 0xffffff00) >>> 8; // extract leftmost 24 bits
  const extractedType = token & 0x000000ff; // extract rightmost 8 bits
  return [extractedStartIndex, extractedType];
}
