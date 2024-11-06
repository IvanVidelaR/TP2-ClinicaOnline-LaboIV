import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { noAuthAdminGuard } from './guards/no-auth-admin.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'welcome-page',
        pathMatch: 'full'
    },
    {
        path: '',
        loadComponent: () => import('./app.component').then((m) => m.AppComponent),
        children: [
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
            },
            {
                path: 'sign-up/eleccion-perfil',
                loadComponent: () => 
                    import('./pages/auth/eleccion-perfil/eleccion-perfil.component').then((m) => m.EleccionPerfilComponent),
            },
        ]
    },
    {
        path: '',
        loadComponent: () => import('./pages/app-with-header/app-with-header.component').then((m) => m.AppWithHeaderComponent),
        children: [
            {
                path: 'welcome-page',
                loadComponent: () => 
                    import('./pages/welcome-page/welcome-page.component').then((m) => m.WelcomePageComponent),
            },
            {
                path: 'usuarios',
                loadComponent: () => 
                    import('./pages/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
                canActivate: [noAuthAdminGuard]
            },
            {
                path: 'mis-turnos',
                loadComponent: () =>
                    import('./pages/mis-turnos/mis-turnos.component').then((m) => m.MisTurnosComponent)
            },
            {
                path: 'error',
                loadComponent: () => 
                    import('./pages/error/error.component').then((m) => m.ErrorComponent)
            },
        ]
    },
    {
        path: '**',
        redirectTo: 'error',
        pathMatch: 'full'
    }
];
