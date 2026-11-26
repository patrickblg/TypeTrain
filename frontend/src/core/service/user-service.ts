
import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UserIdResponse} from '../model/UserIdResponse';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private readonly USER_KEY = 'currentUser';

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:3000/api';

  readonly currentUserId = signal<number | null>(null);
  readonly currentUserName = signal<string | null>(null);

  constructor() {
    const user = this.getUser();

    if (user) {
      this.currentUserId.set(user.id);
      this.currentUserName.set(user.name);
    }
  }

  getUserIdbyName(name: string): Observable<UserIdResponse>{
    return this.http.get<UserIdResponse>(`${this.apiUrl}/userData/${encodeURIComponent(name)}`);
  }

  createUser(name: string): Observable<UserIdResponse> {
    return this.http.post<UserIdResponse>(`${this.apiUrl}/userData`, {name});
  }

  setCurrentUser(userId: number, name: string): void {
    this.currentUserId.set(userId);
    this.currentUserName.set(name);

    sessionStorage.setItem(this.USER_KEY, JSON.stringify({
      id: userId,
      name: name
    }));
  }

  getUser(): {id: number, name: string} | null {
    const user = sessionStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    sessionStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
    this.currentUserId.set(null);
    this.currentUserName.set(null);

  }
}
