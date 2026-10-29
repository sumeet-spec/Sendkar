import { randomInt } from "crypto";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/l/i: easy to read out or type from a poster

/** The public part of a shop's join link. It only lets a person add themselves to that shop's list. */
export function newJoinCode(length = 8): string {
  return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

export const isJoinCode = (v: string) => /^[a-z2-9]{6,12}$/.test(v);
