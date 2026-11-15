import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionServicio } from '../../funcionalidades/autenticacion/servicios/sesion.servicio';

export const protegerSesion: CanActivateFn = () => {
  const sesion = inject(SesionServicio).sesion();
  return sesion ? true : inject(Router).createUrlTree(['/iniciar-sesion']);
};

export const protegerAdministrador: CanActivateFn = () => {
  const sesion = inject(SesionServicio).sesion();

  if (!sesion) {
    return inject(Router).createUrlTree(['/iniciar-sesion']);
  }

  return sesion.user.tipoUsuario ? true : inject(Router).createUrlTree(['/usuario']);
};

export const protegerUsuario: CanActivateFn = () => {
  const sesion = inject(SesionServicio).sesion();

  if (!sesion) {
    return inject(Router).createUrlTree(['/iniciar-sesion']);
  }

  return sesion.user.tipoUsuario ? inject(Router).createUrlTree(['/administrador']) : true;
};

export const redirigirSesionActiva: CanActivateFn = () => {
  const sesion = inject(SesionServicio).sesion();

  if (!sesion) {
    return true;
  }

  return inject(Router).createUrlTree([sesion.user.tipoUsuario ? '/administrador' : '/usuario']);
};
