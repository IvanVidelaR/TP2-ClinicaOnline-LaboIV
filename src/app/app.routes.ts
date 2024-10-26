import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadComponent: () =>
            import('./pages/auth/auth.component').then((m) => m.AuthComponent)
    },
    {
        path: 'sign-up',
        loadComponent: () => 
            import('./pages/auth/sign-up/sign-up.component').then((m) => m.SignUpComponent)
    }
];
