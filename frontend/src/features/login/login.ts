import {Component, inject, signal} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatFormField, MatInputModule, MatLabel} from '@angular/material/input';
import {Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {UserService} from '../../core/service/user-service';


@Component({
  selector: 'app-login',
  imports: [
    MatCard,
    MatCardHeader,
    MatInputModule,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatButton,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private readonly router = inject(Router);
  private readonly userSerivce = inject(UserService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  showProfile(nameInput: string): void {
    const trimmedName = nameInput.trim();
    if(!trimmedName) {
      this.errorMessage.set('Bitte gib einen Namen ein.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userSerivce.getUserIdbyName(trimmedName).subscribe({
      next: (res) => {
        console.log(res);
        this.isLoading.set(false);
        if(res.userID !== null){
          this.userSerivce.setCurrentUser(res.userID, trimmedName);
          this.router.navigate(['/profile', res.userID]);
        }else{
          this.errorMessage.set('Benutzer nicht gefuden.');
        }
      },
      error: (err) => {
        console.error('login error: ',err);
        this.isLoading.set(false);
        this.errorMessage.set('Verbindung zum Server fehlgeschlagen.');
      }
    })
  }
}
