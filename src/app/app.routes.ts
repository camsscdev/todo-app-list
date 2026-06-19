import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'task',
    loadComponent: () => import('./pages/task/task.component'),
  },
  {
    path: '**',
    redirectTo: '/task',
    pathMatch: 'full',
  },
];
