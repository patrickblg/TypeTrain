export interface AttemptDto {
  attemptID: number;
  levelID: number;
  userID: number;
  isCompleted: boolean | number;
  stars: number;
  time: number;
  nMistakes: number;
  percentCorrect: number;
  timeDateStamp: number | string;

}
