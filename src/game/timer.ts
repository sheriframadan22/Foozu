export const QUESTION_SECONDS = 20;
export const URGENT_THRESHOLD = 5; // final 5 seconds are "urgent" (scaled up with the longer timer)

export function isUrgent(secondsLeft: number): boolean {
  return secondsLeft > 0 && secondsLeft <= URGENT_THRESHOLD;
}
