import { Injectable, signal } from '@angular/core';

export type TipoToast = 'exito' | 'error' | 'aviso' | 'informacion';

export interface ToastNotificacion {
  id: number;
  mensaje: string;
  tipo: TipoToast;
}

@Injectable({ providedIn: 'root' })
export class ToastServicio {
  private siguienteId = 0;
  readonly notificaciones = signal<ToastNotificacion[]>([]);

  mostrar(mensaje: string, tipo: TipoToast = 'informacion', duracion = 4500): void {
    const id = ++this.siguienteId;
    this.notificaciones.update((actuales) => [...actuales, { id, mensaje, tipo }]);
    window.setTimeout(() => this.cerrar(id), duracion);
  }

  exito(mensaje: string): void { this.mostrar(mensaje, 'exito'); }
  error(mensaje: string): void { this.mostrar(mensaje, 'error', 6000); }
  aviso(mensaje: string): void { this.mostrar(mensaje, 'aviso'); }

  cerrar(id: number): void {
    this.notificaciones.update((actuales) => actuales.filter((toast) => toast.id !== id));
  }
}
