import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { URL_API_SIDETICKET } from '../../../nucleo/configuracion/api.configuracion';
import { CredencialesAcceso, DatosSesion, RespuestaApi } from '../modelos/autenticacion.modelos';
import { SesionServicio } from './sesion.servicio';

@Injectable({ providedIn: 'root' })
export class AutenticacionServicio {
  private readonly http = inject(HttpClient);
  private readonly sesionServicio = inject(SesionServicio);
  private readonly urlApi = inject(URL_API_SIDETICKET);
  private readonly urlAutenticacion = `${this.urlApi}/Autenticacion`;

  iniciarSesion(credenciales: CredencialesAcceso, recordar: boolean): Observable<DatosSesion> {
    return this.http
      .post<RespuestaApi<DatosSesion>>(`${this.urlAutenticacion}/IniciarSesion`, credenciales)
      .pipe(
        map((respuesta) => {
          if (!respuesta.success || !respuesta.data) {
            throw new Error(respuesta.message ?? 'No fue posible iniciar sesión.');
          }

          return respuesta.data;
        }),
        tap((sesion) => this.sesionServicio.guardar(sesion, recordar)),
      );
  }

  renovarToken(): Observable<DatosSesion> {
    const refreshToken = this.sesionServicio.sesion()?.refreshToken;

    if (!refreshToken) {
      throw new Error('No existe una sesión que se pueda renovar.');
    }

    return this.http
      .post<RespuestaApi<DatosSesion>>(`${this.urlAutenticacion}/RenovarToken`, { refreshToken })
      .pipe(
        map((respuesta) => {
          if (!respuesta.success || !respuesta.data) {
            throw new Error(respuesta.message ?? 'No fue posible renovar la sesión.');
          }

          return respuesta.data;
        }),
        tap((sesion) => this.sesionServicio.guardar(sesion, true)),
      );
  }

  cerrarSesion(): Observable<void> {
    const refreshToken = this.sesionServicio.sesion()?.refreshToken;

    if (!refreshToken) {
      this.sesionServicio.limpiar();
      return new Observable<void>((suscriptor) => {
        suscriptor.next();
        suscriptor.complete();
      });
    }

    return this.http
      .post<RespuestaApi<boolean>>(`${this.urlAutenticacion}/CerrarSesion`, { refreshToken })
      .pipe(
        tap(() => this.sesionServicio.limpiar()),
        map(() => undefined),
      );
  }
}
