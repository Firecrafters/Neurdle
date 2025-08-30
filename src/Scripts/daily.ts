import answerList from "./answers.js";
import debugLog from "./logger.js";

export default function generateDailyWord(): string {
    const date = new Date();
    const day = date.getDay();
    const dayOfMonth = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    let index = Math.floor(day * month * dayOfMonth * (year * 0.001));
    index = ((index % answerList.length) + answerList.length) % answerList.length;

    debugLog(`Answer index: ${index}`);
    debugLog(`Answer: ${answerList[index]}`);

    return answerList[index] as string;
}
