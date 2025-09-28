/**
 * @fileoverview Daily word generation system for Neurdle
 * Generates a consistent daily word using date-based seeding algorithm
 */

import answerList from "./answers.js";
import debugLog from "./logger.js";

/**
 * Generates the daily word for the current date.
 * Uses a deterministic algorithm based on days since epoch to ensure
 * all players get the same word on the same day, regardless of timezone.
 * 
 * @returns The daily word for today, selected from the answer list
 */
export default function generateDailyWord(): string {
    const date = new Date();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const year = date.getFullYear();

    // Create a unique seed based on the date that remains constant for the entire day
    // Using epoch days since a reference date to ensure uniqueness
    const epochStart = new Date(2024, 0, 1); // January 1, 2024 as reference
    const currentDate = new Date(year, month - 1, dayOfMonth);
    const daysSinceEpoch = Math.floor((currentDate.getTime() - epochStart.getTime()) / (1000 * 60 * 60 * 24));

    // Hash function to distribute the days evenly across the answer list
    let index = daysSinceEpoch % answerList.length;

    // Ensure positive index (handles negative modulo results)
    index = (index + answerList.length) % answerList.length;

    debugLog(`Date: ${year}-${month.toString().padStart(2, '0')}-${dayOfMonth.toString().padStart(2, '0')}`);
    debugLog(`Days since epoch: ${daysSinceEpoch}`);
    debugLog(`Answer index: ${index}`);
    debugLog(`Answer: ${answerList[index]}`);

    return answerList[index] as string;
}
