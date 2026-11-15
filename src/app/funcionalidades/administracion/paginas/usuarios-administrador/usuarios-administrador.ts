import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { Paginacion } from '../../../../compartido/componentes/paginacion/paginacion';
import { ToastServicio } from '../../../../compartido/servicios/toast.servicio';
import {
  UsuarioAdministracion,
  UsuarioCrearPeticion,
  UsuarioModificarPeticion,
} from '../../modelos/usuario-administracion.modelo';
import { UsuariosAdministracionServicio } from '../../servicios/usuarios-administracion.servicio';
import { EmpresaAdministracion } from '../../modelos/empresa-administracion.modelo';
import { EmpresasAdministracionServicio } from '../../servicios/empresas-administracion.servicio';

@Component({
  imports: [DatePipe, Paginacion, ReactiveFormsModule],
  selector: 'app-usuarios-administrador',
  styleUrl: './usuarios-administrador.css',
  templateUrl: './usuarios-administrador.html',
})
export class UsuariosAdministrador implements OnInit {
  private readonly formularioConstructor = inject(FormBuilder);
  private readonly usuariosServicio = inject(UsuariosAdministracionServicio);
  private readonly empresasServicio = inject(EmpresasAdministracionServicio);
  private readonly toast = inject(ToastServicio);

  protected readonly usuarios = signal<UsuarioAdministracion[]>([]);
  protected readonly empresas = signal<EmpresaAdministracion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly contrasenaVisible = signal(false);
  protected readonly busqueda = signal('');
  protected readonly pagina = signal(1);
  protected readonly elementosPorPagina = 6;
  protected readonly formularioVisible = signal(false);
  protected readonly usuarioEdicion = signal<UsuarioAdministracion | null>(null);
  protected readonly usuarioEliminar = signal<UsuarioAdministracion | null>(null);
  protected readonly administradores = computed(() => this.usuarios().filter((usuario) => usuario.tipoUsuario).length);
  protected readonly usuariosActivos = computed(() => this.usuarios().filter((usuario) => usuario.isActive).length);
  protected readonly usuariosFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    return termino
      ? this.usuarios().filter((usuario) =>
          `${usuario.usuario} ${usuario.empresa ?? ''} ${usuario.tipoUsuario ? 'administrador' : 'usuario'} ${usuario.isActive ? 'activo' : 'inactivo'}`
            .toLowerCase()
            .includes(termino),
        )
      : this.usuarios();
  });
  protected readonly usuariosPaginados = computed(() => {
    const inicio = (this.pagina() - 1) * this.elementosPorPagina;
    return this.usuariosFiltrados().slice(inicio, inicio + this.elementosPorPagina);
  });

  protected readonly formulario = this.formularioConstructor.nonNullable.group({
    usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
    idEmpresa: [0, [Validators.required, Validators.min(1)]],
    tipoUsuario: [false],
    contrasenaTemporal: ['', [Validators.required, Validators.maxLength(128)]],
  });

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarEmpresas();
  }

  protected buscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
    this.pagina.set(1);
  }

  protected abrirCrear(): void {
    this.usuarioEdicion.set(null);
    this.contrasenaVisible.set(false);
    this.formulario.controls.contrasenaTemporal.setValidators([Validators.required, Validators.maxLength(128)]);
    this.formulario.controls.contrasenaTemporal.updateValueAndValidity();
    this.formulario.reset({ usuario: '', idEmpresa: 0, tipoUsuario: false, contrasenaTemporal: '' });
    this.formularioVisible.set(true);
  }

  protected abrirEditar(usuario: UsuarioAdministracion): void {
    this.usuarioEdicion.set(usuario);
    this.contrasenaVisible.set(false);
    this.formulario.controls.contrasenaTemporal.setValidators(Validators.maxLength(128));
    this.formulario.controls.contrasenaTemporal.updateValueAndValidity();
    this.formulario.reset({
      usuario: usuario.usuario,
      idEmpresa: usuario.idEmpresa ?? 0,
      tipoUsuario: usuario.tipoUsuario,
      contrasenaTemporal: '',
    });
    this.formularioVisible.set(true);
  }

  protected cerrarFormulario(): void {
    if (!this.guardando()) this.formularioVisible.set(false);
  }

  protected alternarContrasena(): void {
    this.contrasenaVisible.update((visible) => !visible);
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valor = this.formulario.getRawValue();
    const usuario = this.usuarioEdicion();
    const peticionBase: UsuarioModificarPeticion = {
      usuario: valor.usuario.trim(),
      idEmpresa: valor.idEmpresa,
      tipoUsuario: valor.tipoUsuario,
      temporaryPassword: valor.contrasenaTemporal,
    };
    const operacion: Observable<UsuarioAdministracion> = usuario
      ? this.usuariosServicio.modificar(usuario.id, peticionBase)
      : this.usuariosServicio.crear({
          ...peticionBase,
        } satisfies UsuarioCrearPeticion);

    this.guardando.set(true);
    operacion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.formularioVisible.set(false);
        this.toast.exito(usuario ? 'Usuario modificado correctamente.' : 'Usuario creado correctamente.');
        this.cargarUsuarios(false);
      },
      error: (error: unknown) => this.toast.error(this.obtenerMensajeError(error)),
    });
  }

  protected confirmarEliminar(usuario: UsuarioAdministracion): void {
    this.usuarioEliminar.set(usuario);
  }

  protected cancelarEliminar(): void {
    if (!this.eliminando()) this.usuarioEliminar.set(null);
  }

  protected eliminar(): void {
    const usuario = this.usuarioEliminar();
    if (!usuario) return;

    this.eliminando.set(true);
    this.usuariosServicio
      .eliminar(usuario.id)
      .pipe(finalize(() => this.eliminando.set(false)))
      .subscribe({
        next: () => {
          this.usuarioEliminar.set(null);
          this.toast.exito('Usuario eliminado correctamente.');
          this.cargarUsuarios(false);
        },
        error: (error: unknown) => this.toast.error(this.obtenerMensajeError(error)),
      });
  }

  protected cargarUsuarios(mostrarCarga = true): void {
    if (mostrarCarga) this.cargando.set(true);
    this.usuariosServicio
      .listar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (usuarios) => {
          this.usuarios.set(usuarios);
          const ultimaPagina = Math.max(1, Math.ceil(this.usuariosFiltrados().length / this.elementosPorPagina));
          if (this.pagina() > ultimaPagina) this.pagina.set(ultimaPagina);
        },
        error: (error: unknown) => this.toast.error(this.obtenerMensajeError(error)),
      });
  }

  private cargarEmpresas(): void {
    this.empresasServicio.listar().subscribe({
      next: (empresas) => this.empresas.set(empresas.filter((empresa) => empresa.flagEstado)),
      error: () => this.toast.error('No se pudieron cargar las empresas para asignar al usuario.'),
    });
  }

  private obtenerMensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'No se pudo conectar con SIDE-API.';
      const mensajeApi = error.error?.message;
      if (typeof mensajeApi === 'string' && mensajeApi.length > 0) return mensajeApi;
      if (error.status === 403) return 'No tienes permisos para administrar usuarios.';
    }
    return error instanceof Error ? error.message : 'No se pudo completar la operación.';
  }
}
