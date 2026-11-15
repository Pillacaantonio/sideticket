import { Injectable, signal } from '@angular/core';
import { DatosSesion } from '../modelos/autenticacion.modelos';

const CLAVE_SESION = 'sideticket.sesion';

@Injectable({ providedIn: 'root' })
export class SesionServicio {
  private readonly datosGuardados = this.leerSesion();

  readonly sesion = signal<DatosSesion | null>(this.datosGuardados);

  guardar(sesion: DatosSesion, recordar: boolean): void {
    this.limpiarAlmacenamiento();
    const almacenamiento = recordar ? localStorage : sessionStorage;
    almacenamiento.setItem(CLAVE_SESION, JSON.stringify(sesion));
    this.sesion.set(sesion);
  }

  limpiar(): void {
    this.limpiarAlmacenamiento();
    this.sesion.set(null);
  }

  obtenerTokenAcceso(): string | null {
    return this.sesion()?.accessToken ?? null;
  }

  private leerSesion(): DatosSesion | null {
    const valor = localStorage.getItem(CLAVE_SESION) ?? sessionStorage.getItem(CLAVE_SESION);

    if (!valor) {
      return null;
    }

    try {
      return JSON.parse(valor) as DatosSesion;
    } catch {
      this.limpiarAlmacenamiento();
      return null;
    }
  }

  private limpiarAlmacenamiento(): void {
    localStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem(CLAVE_SESION);
  }
}
