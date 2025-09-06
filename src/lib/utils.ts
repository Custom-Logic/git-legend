/**
 * @file This file contains utility functions.
 * @exports cn
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function that merges class names.
 * It uses `clsx` to conditionally apply class names and `tailwind-merge` to merge them.
 * @param {...ClassValue} inputs - The class names to merge.
 * @returns {string} The merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
