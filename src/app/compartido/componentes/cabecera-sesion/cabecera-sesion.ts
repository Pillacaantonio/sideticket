import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AutenticacionServicio } from '../../../funcionalidades/autenticacion/servicios/autenticacion.servicio';
import { SesionServicio } from '../../../funcionalidades/autenticacion/servicios/sesion.servicio';
import { Marca } from '../marca/marca';

@Component({
  imports: [Marca],
  selector: 'app-cabecera-sesion',
  styleUrl: './cabecera-sesion.css',
  templateUrl: './cabecera-sesion.html',
})
export class CabeceraSesion {
  private readonly autenticacionServicio = inject(AutenticacionServicio);
  private readonly sesionServicio = inject(SesionServicio);
  private readonly router = inject(Router);

  readonly seccion = input.required<string>();
  readonly cerrando = signal(false);
  readonly usuario = this.sesionServicio.sesion()?.user.userName ?? 'Usuario';

  cerrarSesion(): void {
    if (this.cerrando()) {
      return;
    }

    this.cerrando.set(true);
    this.autenticacionServicio
      .cerrarSesion()
      .pipe(
        finalize(() => {
          this.sesionServicio.limpiar();
          this.cerrando.set(false);
          void this.router.navigate(['/iniciar-sesion']);
        }),
      )
      .subscribe({ error: () => undefined });
  }
}
