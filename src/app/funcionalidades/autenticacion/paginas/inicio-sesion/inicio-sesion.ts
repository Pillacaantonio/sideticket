import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Marca } from '../../../../compartido/componentes/marca/marca';
import { ToastServicio } from '../../../../compartido/servicios/toast.servicio';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';

@Component({
  imports: [ReactiveFormsModule, Marca],
  selector: 'app-inicio-sesion',
  styleUrl: './inicio-sesion.css',
  templateUrl: './inicio-sesion.html',
})
export class InicioSesion {
  private readonly formBuilder = inject(FormBuilder);
  private readonly autenticacionServicio = inject(AutenticacionServicio);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastServicio);

  protected readonly formularioAcceso = this.formBuilder.nonNullable.group({
    usuario: ['', Validators.required],
    contrasena: ['', Validators.required],
    recordar: [false],
  });

  protected readonly contrasenaVisible = signal(false);
  protected readonly cargando = signal(false);

  protected alternarContrasena(): void {
    this.contrasenaVisible.update((visible) => !visible);
  }

  protected enviarAcceso(): void {
    if (this.formularioAcceso.invalid) {
      this.formularioAcceso.markAllAsTouched();
      return;
    }

    const datosFormulario = this.formularioAcceso.getRawValue();
    this.cargando.set(true);

    this.autenticacionServicio
      .iniciarSesion(
        {
          userName: datosFormulario.usuario.trim(),
          password: datosFormulario.contrasena,
        },
        datosFormulario.recordar,
      )
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (sesion) =>
          void this.router.navigate([sesion.user.tipoUsuario ? '/administrador' : '/usuario']),
        error: (error: unknown) => this.toast.error(this.obtenerMensajeError(error)),
      });
  }

  private obtenerMensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con SIDE-API. Verifica que esté ejecutándose en https://localhost:44320.';
      }

      const mensajeApi = error.error?.message;
      if (typeof mensajeApi === 'string' && mensajeApi.length > 0) {
        return mensajeApi;
      }

      if (error.status === 401) {
        return 'Usuario o contraseña incorrectos.';
      }
    }

    return error instanceof Error ? error.message : 'Ocurrió un error inesperado al iniciar sesión.';
  }
}
