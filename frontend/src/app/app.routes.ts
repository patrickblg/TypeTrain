import { Routes, Router } from '@angular/router';
import {Login} from '../features/login/login';
import {authGuard} from '../core/guards/auth.guard';
import {Protocol} from '../features/protocol/protocol';
export const routes: Routes = [

  {
    path: 'login',
    component: Login
  },
  {
    path: 'protocol',
    component: Protocol,
    canActivate: [authGuard],
  },
  // {
  //   path: 'levels',
  //   component: LevelOverview,
  //   canActivate: [authGuard],
  //
  // },
  {
    path : '**',
    redirectTo : 'login'

  }
];
