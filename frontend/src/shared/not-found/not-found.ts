import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/service/user-service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  private readonly userService = inject(UserService);

  readonly isLoggedIn = computed(() => this.userService.currentUserId() !== null);
}
