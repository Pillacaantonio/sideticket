import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { URL_API_SIDETICKET } from '../../../nucleo/configuracion/api.configuracion';
import { RespuestaApi } from '../../autenticacion/modelos/autenticacion.modelos';
import {
  UsuarioAdministracion,
  UsuarioCrearPeticion,
  UsuarioModificarPeticion,
} from '../modelos/usuario-administracion.modelo';

@Injectable({ providedIn: 'root' })
export class UsuariosAdministracionServicio {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API_SIDETICKET);

  listar(): Observable<UsuarioAdministracion[]> {
    return this.http
      .get<RespuestaApi<UsuarioAdministracion[]>>(`${this.urlApi}/Usuarios/`)
      .pipe(map((respuesta) => respuesta.data ?? []));
  }

  crear(usuario: UsuarioCrearPeticion): Observable<UsuarioAdministracion> {
    return this.http
      .post<RespuestaApi<UsuarioAdministracion>>(`${this.urlApi}/Usuarios/`, usuario)
      .pipe(map((respuesta) => this.obtenerDatos(respuesta)));
  }

  modificar(id: number, usuario: UsuarioModificarPeticion): Observable<UsuarioAdministracion> {
    return this.http
      .put<RespuestaApi<UsuarioAdministracion>>(`${this.urlApi}/Usuarios/${id}`, usuario)
      .pipe(map((respuesta) => this.obtenerDatos(respuesta)));
  }

  eliminar(id: number): Observable<boolean> {
    return this.http
      .delete<RespuestaApi<boolean>>(`${this.urlApi}/Usuarios/${id}`)
      .pipe(map((respuesta) => respuesta.data ?? false));
  }

  private obtenerDatos(respuesta: RespuestaApi<UsuarioAdministracion>): UsuarioAdministracion {
    if (!respuesta.success || !respuesta.data) {
      throw new Error(respuesta.message ?? 'SIDE-API no devolvió los datos del usuario.');
    }
    return respuesta.data;
  }
}
