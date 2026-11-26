export interface LevelCardItem {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  bestStars: number;
  bestPercent: number | null;
}
