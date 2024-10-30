import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'welcome-page',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadComponent: () =>
            import('./pages/auth/auth.component').then((m) => m.AuthComponent),
        canActivate: [authGuard]
    },
    {
        path: 'sign-up',
        loadComponent: () => 
            import('./pages/auth/sign-up/sign-up.component').then((m) => m.SignUpComponent),
        canActivate: [authGuard]
    },
    {
        path: 'sign-up/eleccion-perfil',
        loadComponent: () => 
            import('./pages/auth/eleccion-perfil/eleccion-perfil.component').then((m) => m.EleccionPerfilComponent),
        canActivate: [authGuard]
    },
    {
        path: 'welcome-page',
        loadComponent: () => 
            import('./pages/welcome-page/welcome-page.component').then((m) => m.WelcomePageComponent),
    }
];
