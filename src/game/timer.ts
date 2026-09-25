export const QUESTION_SECONDS = 10;
export const URGENT_THRESHOLD = 3; // seconds 3,2,1 are "urgent"

export function isUrgent(secondsLeft: number): boolean {
  return secondsLeft > 0 && secondsLeft <= URGENT_THRESHOLD;
}
