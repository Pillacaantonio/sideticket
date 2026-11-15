import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SesionServicio } from '../../funcionalidades/autenticacion/servicios/sesion.servicio';
import { URL_API_SIDETICKET } from '../configuracion/api.configuracion';

export const autenticacionInterceptor: HttpInterceptorFn = (solicitud, siguiente) => {
  const urlApi = inject(URL_API_SIDETICKET);
  const token = inject(SesionServicio).obtenerTokenAcceso();

  if (!token || !solicitud.url.startsWith(urlApi)) {
    return siguiente(solicitud);
  }

  return siguiente(
    solicitud.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
