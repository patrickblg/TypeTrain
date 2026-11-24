import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {LevelService} from '../../core/service/level-service';
import {UserService} from '../../core/service/user-service';
import {Router} from '@angular/router';
import {LevelDto} from '../../core/model/LevelDto';
import {AttemptDto} from '../../core/model/AttemptDto';
import {LevelCardItem} from '../../core/model/LevelCardItem';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-level-overview',
  imports: [],
  templateUrl: './level-overview.html',
  styleUrl: './level-overview.css',
})
export class LevelOverview {
  private readonly levelService = inject(LevelService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly completedLevels = signal(0);
  readonly totalLevels = signal(0);
  readonly levels = signal<LevelDto[]>([]);
  readonly attempts = signal<AttemptDto[]>([]);
  readonly starSlots = [1, 2, 3];


  //TODO: make signal, signal.set(getAllLevelPercentage(userID))
  readonly progressPercent = computed(() => {
    const total = this.totalLevels();
    if (total <= 0) return 0;
    return Math.min(100, Math.round((this.completedLevels() / total) * 100));
  });

  readonly levelCards = computed<LevelCardItem[]>(() => {
    const attemptsByLevel = new Map<number, AttemptDto[]>();

    for (const attempt of this.attempts()) {
      const list = attemptsByLevel.get(attempt.levelID) ?? [];
      list.push(attempt);
      attemptsByLevel.set(attempt.levelID, list);
    }

    return this.levels().map((lvl) => {
      const lvlAttempts = attemptsByLevel.get(lvl.levelID) ?? [];
      const isCompleted = lvlAttempts.some((a) => a.isCompleted === 1);
      const bestStars = lvlAttempts.reduce((max, a) => Math.max(max, a.stars), 0);
      const bestPercent =
        lvlAttempts.length > 0
          ? Math.round(lvlAttempts.reduce((max, a) => Math.max(max, a.percentCorrect), 0))
          : null;

      const preview =
        lvl.levelString.length > 35
          ? `${lvl.levelString.slice(0, 35)}...`
          : lvl.levelString;

      return {
        id: lvl.levelID,
        title: `Level ${lvl.levelID}`,
        description: lvl.types?.length ? lvl.types.join(', ') : preview,
        isCompleted,
        bestStars: Math.min(3, Math.max(0, bestStars)),
        bestPercent,
      };
    });
  });

  readonly nextLevel = computed(() => {
    const cards = this.levelCards();
    return cards.find((c) => !c.isCompleted) ?? cards[0] ?? null;
  });

  ngOnInit(): void {
    const userID = this.userService.currentUserId();
    if (userID === null) {
      this.isLoading.set(false);
      this.errorMessage.set('Kein Benutzer angemeldet.');
      return;
    }
    forkJoin({
      levels: this.levelService.getLevels(),
      nLevels: this.levelService.getNLevels(),
      nCompleted: this.levelService.getNCompletedLevels(userID),
      attempts: this.levelService.getAllAttempts(userID),
    }).subscribe({
      next: ({ levels, nLevels, nCompleted, attempts }) => {
        this.levels.set(levels.levels ?? []);
        this.totalLevels.set(nLevels.nLevels ?? levels.levels?.length ?? 0);
        this.completedLevels.set(nCompleted.nCompletedLevels ?? 0);
        this.attempts.set(attempts.allAttempts ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Level overview failed.', err);
        this.errorMessage.set('Lektionen konnten nicht geladen werden.');
        this.isLoading.set(false);
      }
    })
  }

  startLevel(levelId: number): void{
    this.router.navigate(['/level/' + levelId]);
  }

}
