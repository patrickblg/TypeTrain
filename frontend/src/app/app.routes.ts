import { Routes, Router } from '@angular/router';
import {Login} from '../features/login/login';
import {authGuard} from '../core/guards/auth.guard';
import {Protocol} from '../features/protocol/protocol';
import {LevelOverview} from '../features/level-overview/level-overview';
export const routes: Routes = [

  {
    path: 'login',
    component: Login
  },
  {
    path: 'protocol',
    component: Protocol,

  },
  {
    path: 'levels',
    component: LevelOverview,

  },
  {
    path : '**',
    redirectTo : 'login'

  }
];
