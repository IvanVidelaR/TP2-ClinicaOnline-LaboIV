import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { noAuthAdminGuard } from './guards/no-auth-admin.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { MisHorariosComponent } from './pages/mis-horarios/mis-horarios.component';

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
                data: { animation: 'WelcomePage' }
            },
            {
                path: 'usuarios',
                loadComponent: () => 
                    import('./pages/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
                canActivate: [noAuthAdminGuard],
                data: { animation: 'UsersPage' }
            },
            {
                path: 'mis-turnos',
                loadComponent: () =>
                    import('./pages/mis-turnos/mis-turnos.component').then((m) => m.MisTurnosComponent),
                canActivate: [noAuthGuard],
                data: { animation: 'MyAppointmentsPage' }
            },
            {
                path: 'mi-perfil',
                loadComponent: () =>
                    import('./pages/mi-perfil/mi-perfil.component').then((m) => m.MiPerfilComponent),
                canActivate: [noAuthGuard],
                data: { animation: 'MyProfilePage' }
            },
            {
                path: 'mis-horarios',
                loadComponent: () =>
                    import('./pages/mis-horarios/mis-horarios.component').then((m) => m.MisHorariosComponent),
                canActivate: [noAuthGuard],
                data: { animation: 'MySchedulesPage' }
            },
            {
                path: 'turnos',
                loadComponent: () => 
                    import('./pages/turnos/turnos.component').then((m) => m.TurnosComponent),
                canActivate: [noAuthAdminGuard],
                data: { animation: 'AppointmentsPage' }
            },
            {
                path: 'solicitar-turno',
                loadComponent: () => 
                    import('./pages/solicitar-turno/solicitar-turno.component').then((m) => m.SolicitarTurnoComponent),
                canActivate: [noAuthGuard],
                data: { animation: 'RequestAppointmentPage' }
            },
            {
                path: 'mis-pacientes',
                loadComponent: () => 
                    import('./pages/mis-pacientes/mis-pacientes.component').then((m) => m.MisPacientesComponent),
                canActivate: [noAuthGuard],
                data: { animation: 'MyPatientsPage' }
            },
            {
                path: 'estadisticas',
                loadComponent: () => 
                    import('./pages/estadisticas/estadisticas.component').then((m) => m.EstadisticasComponent),
                canActivate: [noAuthAdminGuard],
                data: { animation: 'StatisticsPage' }
            },
            {
                path: 'estadisticas/logs-ingresos',
                loadComponent: () => 
                    import('./pages/estadisticas/log-usuarios/log-usuarios.component').then((m) => m.LogUsuariosComponent),
                canActivate: [noAuthAdminGuard],
                data: { animation: 'UserLogsPage' }
            },
            {
                path: 'estadisticas/turnos-por-especialidad',
                loadComponent: () => 
                    import('./pages/estadisticas/turnos-por-especialidad/turnos-por-especialidad.component').then((m) => m.TurnosPorEspecialidadComponent),
                canActivate: [noAuthAdminGuard],
                data: { animation: 'SpecialtyAppointmentPage' }
            },
            {
                path: 'estadisticas/turnos-por-dia',
                loadComponent: () => 
                    import('./pages/estadisticas/turnos-por-dia/turnos-por-dia.component').then((m) => m.TurnosPorDiaComponent),
                canActivate: [noAuthAdminGuard],
                data: { animation: 'DayAppointmentPage' }
            },
            {
                path: 'estadisticas/turnos-solicitados',
                loadComponent: () => 
                    import('./pages/estadisticas/turnos-solicitados/turnos-solicitados.component').then((m) => m.TurnosSolicitadosComponent),
                canActivate: [noAuthAdminGuard],
                data: { animation: 'RequestAppointmentPage' }
            },
            {
                path: 'estadisticas/turnos-finalizados',
                loadComponent: () => 
                    import('./pages/estadisticas/turnos-finalizados/turnos-finalizados.component').then((m) => m.TurnosFinalizadosComponent),
                canActivate: [noAuthAdminGuard],
                data: { animation: 'FinishedtAppointmentPage' }
            },
            {
                path: 'error',
                loadComponent: () => 
                    import('./pages/error/error.component').then((m) => m.ErrorComponent),
                data: { animation: 'ErrorPage' } 
            },
        ]
    },
    {
        path: '**',
        redirectTo: 'error',
        pathMatch: 'full'
    }
];
