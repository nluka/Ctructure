import TokenType from './TokenType';

/**
 * Encodes the start index (left 25 bits) and type (right 7 bits) into a single
 * number which can then be decoded with `tokenDecode`.
 * @param startIndex The startIndex of the token.
 * @param type The type of the token.
 * @returns The encoded token.
 */
export default function tokenEncode(
  startIndex: number,
  type: TokenType,
): number {
  let encodedToken = 0;
  encodedToken = (encodedToken | startIndex) << 7; // encode startIndex into leftmost 25 bits
  encodedToken = encodedToken | type; // encode type into rightmost 7 bits
  return encodedToken;
}
