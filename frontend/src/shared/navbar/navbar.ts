import {Component, inject, signal} from '@angular/core';
import {UserService} from '../../core/service/user-service';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly userName = this.userService.currentUserName;
  readonly isAudioOn = signal(true);

  toggleAudio(): void {
    //TODO
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/']);
  }
}
