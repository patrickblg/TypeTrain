import {Component, inject} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatFormField, MatInputModule, MatLabel} from '@angular/material/input';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';


@Component({
  selector: 'app-login',
  imports: [
    MatCard,
    MatCardHeader,
    MatInputModule,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatButton,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private readonly router = inject(Router);

  showProfile(nameInput: string): void {
    if(nameInput.trim()){
      this.router.navigate(['/profile', nameInput]);
    }
  }
}
