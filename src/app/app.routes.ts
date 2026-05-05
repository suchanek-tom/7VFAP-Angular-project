import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./features/layout/shell/shell').then(m => m.Shell),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'items',
        loadComponent: () => import('./features/items/item-list/item-list').then(m => m.ItemList),
      },
      {
        path: 'items/new',
        loadComponent: () => import('./features/items/item-form/item-form').then(m => m.ItemForm),
      },
      {
        path: 'items/:id/edit',
        loadComponent: () => import('./features/items/item-form/item-form').then(m => m.ItemForm),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound),
  },
];
