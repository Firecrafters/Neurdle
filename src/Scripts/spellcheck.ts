/**
 * @fileoverview Word validation system using dictionary and answer lists
 * Validates player guesses against known English words and Neuro-themed terms
 */

import words from "./dictionary.js"
import answerList from "./answers.js";

/** Array of valid English dictionary words converted to uppercase for fast lookup */
const englishDict: string[] = [];

// Convert the words to uppercase and add them to `englishDict`
words.forEach((word: string): void => {
    englishDict.push(word.toUpperCase());
});

/**
 * Validates whether a guessed word is acceptable for the game.
 * Checks against both the English dictionary and the custom answer list
 * which includes Neuro-themed words and terms.
 * 
 * @param word - The word to validate (should be uppercase)
 * @returns True if the word is valid, false otherwise
 */
export default function spellCheck(word: string): boolean {
    if (englishDict.includes(word)) return true;
    if (answerList.includes(word)) return true;

    return false;
}
