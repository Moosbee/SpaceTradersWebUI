/**
 * Scales a number from one range to another.
 *
 * @param {number} number - The number to scale.
 * @param {number} inMin - The minimum value of the input range.
 * @param {number} inMax - The maximum value of the input range.
 * @param {number} outMin - The minimum value of the output range.
 * @param {number} outMax - The maximum value of the output range.
 * @returns {number} - The scaled number.
 */
function scaleNum(
  number: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

const cyrb53 = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

function interpolatePosition(
  pos1: [number, number],
  pos2: [number, number],
  percentage: number,
): [number, number] {
  const x = pos1[0] + (pos2[0] - pos1[0]) * percentage;
  const y = pos1[1] + (pos2[1] - pos1[1]) * percentage;
  return [x, y];
}

function seedShuffle<T>(array: T[], seed: number): T[] {
  // Create a copy of the original array
  const result = array.slice();
  let m = result.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(enhancedRandom(seed) * m--);

    // And swap it with the current element.
    t = result[m];
    result[m] = result[i];
    result[i] = t;
    seed++; // Increment seed for the next iteration
  }

  return result; // Return the new shuffled array
}

function enhancedRandom(seed: number): number {
  // Linear Congruential Generator for better randomness
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

export { scaleNum, cyrb53, seedShuffle, interpolatePosition };

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type { Prettify };
