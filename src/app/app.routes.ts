import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'welcome-page',
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
    },
    {
        path: 'sign-up/eleccion-perfil',
        loadComponent: () => 
            import('./pages/auth/eleccion-perfil/eleccion-perfil.component').then((m) => m.EleccionPerfilComponent)
    },
    {
        path: 'welcome-page',
        loadComponent: () => 
            import('./pages/welcome-page/welcome-page.component').then((m) => m.WelcomePageComponent)
    }
];
