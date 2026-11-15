import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { finalize } from 'rxjs';
import { Marca } from '../../../../compartido/componentes/marca/marca';
import { AutenticacionServicio } from '../../../autenticacion/servicios/autenticacion.servicio';
import { SesionServicio } from '../../../autenticacion/servicios/sesion.servicio';

@Component({
  imports: [Marca, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-inicio-administrador',
  styleUrl: './inicio-administrador.css',
  templateUrl: './inicio-administrador.html',
})
export class InicioAdministrador {
  private readonly autenticacionServicio = inject(AutenticacionServicio);
  private readonly sesionServicio = inject(SesionServicio);
  private readonly router = inject(Router);

  protected readonly menuAbierto = signal(false);
  protected readonly cerrando = signal(false);
  protected readonly usuario = this.sesionServicio.sesion()?.user.userName ?? 'Administrador';
  protected readonly inicial = this.usuario.charAt(0).toUpperCase();

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected cerrarSesion(): void {
    if (this.cerrando()) return;

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
