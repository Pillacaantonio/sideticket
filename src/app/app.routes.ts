import { Routes } from '@angular/router';
import {
  protegerAdministrador,
  protegerSesion,
  protegerUsuario,
  redirigirSesionActiva,
} from './nucleo/guardianes/sesion.guardian';

export const routes: Routes = [
  {
    path: 'iniciar-sesion',
    canActivate: [redirigirSesionActiva],
    loadComponent: () =>
      import('./funcionalidades/autenticacion/paginas/inicio-sesion/inicio-sesion').then(
        (modulo) => modulo.InicioSesion,
      ),
  },
  {
    path: 'administrador',
    canActivate: [protegerSesion, protegerAdministrador],
    loadComponent: () =>
      import('./funcionalidades/administracion/paginas/inicio-administrador/inicio-administrador').then(
        (modulo) => modulo.InicioAdministrador,
      ),
    children: [
      {
        path: 'panel',
        loadComponent: () =>
          import('./funcionalidades/administracion/paginas/panel-administrador/panel-administrador').then(
            (modulo) => modulo.PanelAdministrador,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./funcionalidades/administracion/paginas/usuarios-administrador/usuarios-administrador').then(
            (modulo) => modulo.UsuariosAdministrador,
          ),
      },
      {
        path: 'empresas',
        loadComponent: () =>
          import('./funcionalidades/administracion/paginas/empresas-administrador/empresas-administrador').then(
            (modulo) => modulo.EmpresasAdministrador,
          ),
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./funcionalidades/tickets/paginas/tickets-administrador/tickets-administrador').then(
            (modulo) => modulo.TicketsAdministrador,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'panel' },
    ],
  },
  {
    path: 'usuario',
    canActivate: [protegerSesion, protegerUsuario],
    loadComponent: () =>
      import('./funcionalidades/usuarios/paginas/inicio-usuario/inicio-usuario').then(
        (modulo) => modulo.InicioUsuario,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'iniciar-sesion' },
  { path: '**', redirectTo: 'iniciar-sesion' },
];
