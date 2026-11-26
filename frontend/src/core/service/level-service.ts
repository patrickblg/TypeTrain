import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LevelDto} from '../model/LevelDto';
import {AttemptDto} from '../model/AttemptDto';

@Injectable({
  providedIn: 'root',
})
export class LevelService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';


  getLevels(): Observable<{ levels: LevelDto[] }> {
    return this.http.get<{ levels: LevelDto[] }>(`${this.apiUrl}/levels`);
  }

  getNLevels(): Observable<{ nLevels: number }> {
    return this.http.get<{ nLevels: number }>(`${this.apiUrl}/nLevels`);
  }

  getNCompletedLevels(userId: number): Observable<{ nCompletedLevels: number }> {
    return this.http.get<{ nCompletedLevels: number }>(
      `${this.apiUrl}/nCompletedLevels/${userId}`
    );
  }

  getAllAttempts(userId: number): Observable<{ allAttempts: AttemptDto[] }> {
    return this.http.get<{ allAttempts: AttemptDto[] }>(
      `${this.apiUrl}/allAttempts/${userId}`
    );
  }
  getAllLevelPercent(userId: number): Observable<{ percent: number }> {
    return this.http.get<{ percent: number }>(`${this.apiUrl}/allLevelPercent/${userId}`);
  }


}
