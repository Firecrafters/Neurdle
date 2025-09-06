import words from "./dictionary.js"
import answerList from "./answers.js";

const englishDict: string[] = [];
// Convert the words to uppercase and add them to `englishDict`
words.forEach((word: string): void => {
    englishDict.push(word.toUpperCase());
});

export default function spellCheck(word: string): boolean {
    if (englishDict.includes(word)) return true;
    if (answerList.includes(word)) return true;

    return false;
}
