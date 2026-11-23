import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';


export interface UserIdResponse{
  userID: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  readonly currentUserId = signal<number | null>(null);
  readonly currentUserName = signal<string | null>(null);

  getUserIdbyName(name: string): Observable<UserIdResponse>{
    return this.http.get<UserIdResponse>(`${this.apiUrl}/userData/${encodeURIComponent(name)}`);
  }

  createUser(name: string): Observable<UserIdResponse> {
    return this.http.post<UserIdResponse>(`${this.apiUrl}/userData`, {name});
  }

  setCurrentUser(userId: number, name: string): void {
    this.currentUserId.set(userId);
    this.currentUserName.set(name);
  }

  logout(): void {
    this.currentUserId.set(null);
    this.currentUserName.set(null);
  }
}
