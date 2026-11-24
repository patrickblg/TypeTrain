import {Component, computed, inject, OnInit, Signal, signal} from '@angular/core';
import {ProtocolService} from '../../core/service/protocol-service';
import {UserService} from '../../core/service/user-service';
import {AttemptDto} from '../../core/model/AttemptDto';
import {LevelDto} from '../../core/model/LevelDto';
import {ProtocolRow} from '../../core/model/ProtocolRow';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-protocol',
  imports: [],
  templateUrl: './protocol.html',
  styleUrl: './protocol.css',
})
export class Protocol implements OnInit {
  private readonly protocolService = inject(ProtocolService);
  private readonly userService = inject(UserService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly completedLevels = signal(0);
  readonly totalLevels = signal(0);
  readonly attempts = signal<AttemptDto[]>([]);
  readonly levels = signal<LevelDto[]>([]);


  readonly rows = computed<ProtocolRow[]>(() =>
    this.attempts().map((attempt) => ({
      date: this.formatDate(attempt.timeDateStamp),
      levelName: `Level ${attempt.levelID}`,
      status: attempt.isCompleted ? 'Erfolgreich abgeschlossen' : 'Nicht abgeschlossen',
      progress: `${Math.round(attempt.percentCorrect ?? 0)}%`,
      duration: this.formatDuration(attempt.time),
    }))
  );

  ngOnInit(): void {
    const userID = this.userService.currentUserId();
    if(userID === null){
      this.isLoading.set(false);
      this.errorMessage.set('Kein Benutzer angemeldet');
      return;
    }
    this.isLoading.set(true);
    forkJoin({
      nLevels: this.protocolService.getNLevels(),
      nCompleted: this.protocolService.getNCompletedLevels(userID),
      attempts: this.protocolService.getAllAttempts(userID),
      //TODO: recentTotal, recentCompleted
    }).subscribe({
      next: ({nLevels,nCompleted, attempts}) => {
        this.totalLevels.set(nLevels.nLevels ?? 0);
        this.completedLevels.set(nCompleted.nCompletedLevels ?? 0);
        this.attempts.set(attempts.allAttempts ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Protocol load error', err);
        this.errorMessage.set('Protokolldaten konnten nicht geladen werden.');
        this.isLoading.set(false);
      }
    })
  }

  private formatDate(value: number | string): string {
    const ms = typeof value === 'number' && value < 1_000_000_000_000 ? value * 1000 : value;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return '-';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}.${d.getFullYear()}`;
  }

  private formatDuration(seconds: number): string {
    if (seconds == null) return '0:00 min';
    const mins = Math.floor(seconds / 60);
    const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${mins}:${secs} min`;
  }


}
