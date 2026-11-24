import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LevelDto} from '../model/LevelDto';
import {AttemptDto} from '../model/AttemptDto';
import {LevelService} from './level-service';

@Injectable({
  providedIn: 'root',
})
export class ProtocolService {
  private readonly http = inject(HttpClient);
  private readonly levelService = inject(LevelService);
  private readonly apiUrl = 'http://localhost:3000/api';

  getNLevels(): Observable<{nLevels: number}>{
    return this.levelService.getNLevels();
  }

  getNCompletedLevels(userID: number): Observable<{nCompletedLevels: number}>{
    return this.levelService.getNCompletedLevels(userID);
  }

  getLevels(): Observable<{levels: LevelDto[]}>{
    return this.levelService.getLevels();
  }

  getAllAttempts(userID: number): Observable<{allAttempts: AttemptDto[]}>{
    return this.levelService.getAllAttempts(userID)
  }

  getAttemptsLastNDays(userId: number, nDays: number): Observable<{ nAttempts: number }> {
    return this.http.get<{ nAttempts: number }>(
      `${this.apiUrl}/users/${userId}/days/${nDays}/nAttempts`
    );
  }

  getCompletedAttemptsLastNDays(userId: number, nDays: number): Observable<{ nAttemptsCompleted: number }> {
    return this.http.get<{ nAttemptsCompleted: number }>(`${this.apiUrl}/users/${userId}/days/${nDays}/nAttemptsCompleted`
    );
  }
}
