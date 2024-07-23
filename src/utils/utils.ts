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

export { scaleNum };

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type { Prettify };
