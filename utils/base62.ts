/**
 * Nexus Base62 Encoder
 * Converts BigInts to Base62 strings and vice versa.
 */

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BigInt(ALPHABET.length);

export function encode(num: bigint): string {
  if (num === 0n) return ALPHABET[0];
  
  let result = '';
  let n = num;
  
  while (n > 0n) {
    result = ALPHABET[Number(n % BASE)] + result;
    n = n / BASE;
  }
  
  return result;
}

export function decode(str: string): bigint {
  let result = 0n;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = ALPHABET.indexOf(char);
    
    if (index === -1) {
      throw new Error(`Invalid character in base62 string: ${char}`);
    }
    
    result = result * BASE + BigInt(index);
  }
  
  return result;
}
