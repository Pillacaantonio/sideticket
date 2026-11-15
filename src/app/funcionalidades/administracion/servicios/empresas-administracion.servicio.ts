import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { URL_API_SIDETICKET } from '../../../nucleo/configuracion/api.configuracion';
import { RespuestaApi } from '../../autenticacion/modelos/autenticacion.modelos';
import { EmpresaAdministracion, EmpresaPeticion } from '../modelos/empresa-administracion.modelo';

@Injectable({ providedIn: 'root' })
export class EmpresasAdministracionServicio {
  private readonly http = inject(HttpClient);
  private readonly urlEmpresas = `${inject(URL_API_SIDETICKET)}/Empresas`;

  listar(): Observable<EmpresaAdministracion[]> {
    return this.http
      .get<RespuestaApi<EmpresaAdministracion[]>>(`${this.urlEmpresas}/`)
      .pipe(map((respuesta) => respuesta.data ?? []));
  }

  crear(empresa: EmpresaPeticion): Observable<number> {
    return this.http
      .post<RespuestaApi<number>>(`${this.urlEmpresas}/`, empresa)
      .pipe(map((respuesta) => respuesta.data ?? 0));
  }

  modificar(id: number, empresa: EmpresaPeticion): Observable<boolean> {
    return this.http
      .put<RespuestaApi<boolean>>(`${this.urlEmpresas}/${id}`, empresa)
      .pipe(map((respuesta) => respuesta.data ?? false));
  }

  eliminar(id: number): Observable<boolean> {
    return this.http
      .delete<RespuestaApi<boolean>>(`${this.urlEmpresas}/${id}`)
      .pipe(map((respuesta) => respuesta.data ?? false));
  }
}
