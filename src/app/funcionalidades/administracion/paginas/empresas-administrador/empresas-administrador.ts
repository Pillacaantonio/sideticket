import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { Paginacion } from '../../../../compartido/componentes/paginacion/paginacion';
import { ToastServicio } from '../../../../compartido/servicios/toast.servicio';
import { EmpresaAdministracion, EmpresaPeticion } from '../../modelos/empresa-administracion.modelo';
import { EmpresasAdministracionServicio } from '../../servicios/empresas-administracion.servicio';

@Component({
  imports: [DatePipe, ReactiveFormsModule, Paginacion],
  selector: 'app-empresas-administrador',
  styleUrl: './empresas-administrador.css',
  templateUrl: './empresas-administrador.html',
})
export class EmpresasAdministrador implements OnInit {
  private readonly formularioConstructor = inject(FormBuilder);
  private readonly empresasServicio = inject(EmpresasAdministracionServicio);
  private readonly toast = inject(ToastServicio);

  protected readonly empresas = signal<EmpresaAdministracion[]>([]);
  protected readonly busqueda = signal('');
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly pagina = signal(1);
  protected readonly elementosPorPagina = 6;
  protected readonly formularioVisible = signal(false);
  protected readonly empresaEdicion = signal<EmpresaAdministracion | null>(null);
  protected readonly empresaEliminar = signal<EmpresaAdministracion | null>(null);
  protected readonly empresasActivas = computed(() => this.empresas().filter((empresa) => empresa.flagEstado).length);
  protected readonly empresasFiltradas = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    return termino
      ? this.empresas().filter((empresa) =>
          `${empresa.sRazonSocial} ${empresa.sRucEmpresa} ${empresa.sDireccion ?? ''}`.toLowerCase().includes(termino),
        )
      : this.empresas();
  });
  protected readonly empresasPaginadas = computed(() => {
    const inicio = (this.pagina() - 1) * this.elementosPorPagina;
    return this.empresasFiltradas().slice(inicio, inicio + this.elementosPorPagina);
  });

  protected readonly formulario = this.formularioConstructor.nonNullable.group({
    rucEmpresa: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    razonSocial: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    direccion: ['', Validators.maxLength(100)],
  });

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  protected buscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
    this.pagina.set(1);
  }

  protected abrirCrear(): void {
    this.empresaEdicion.set(null);
    this.formulario.reset({ rucEmpresa: '', razonSocial: '', direccion: '' });
    this.formularioVisible.set(true);
  }

  protected abrirEditar(empresa: EmpresaAdministracion): void {
    this.empresaEdicion.set(empresa);
    this.formulario.reset({
      rucEmpresa: empresa.sRucEmpresa,
      razonSocial: empresa.sRazonSocial,
      direccion: empresa.sDireccion ?? '',
    });
    this.formularioVisible.set(true);
  }

  protected cerrarFormulario(): void {
    if (!this.guardando()) this.formularioVisible.set(false);
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valor = this.formulario.getRawValue();
    const peticion: EmpresaPeticion = {
      rucEmpresa: valor.rucEmpresa.trim(),
      razonSocial: valor.razonSocial.trim(),
      direccion: valor.direccion.trim() || null,
    };
    const empresa = this.empresaEdicion();
    const operacion: Observable<number | boolean> = empresa
      ? this.empresasServicio.modificar(empresa.id, peticion)
      : this.empresasServicio.crear(peticion);

    this.guardando.set(true);
    operacion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.formularioVisible.set(false);
        this.toast.exito(empresa ? 'Empresa modificada correctamente.' : 'Empresa creada correctamente.');
        this.cargarEmpresas(false);
      },
      error: (error: unknown) => this.toast.error(this.obtenerMensajeError(error)),
    });
  }

  protected confirmarEliminar(empresa: EmpresaAdministracion): void {
    this.empresaEliminar.set(empresa);
  }

  protected cancelarEliminar(): void {
    if (!this.eliminando()) this.empresaEliminar.set(null);
  }

  protected eliminar(): void {
    const empresa = this.empresaEliminar();
    if (!empresa) return;

    this.eliminando.set(true);
    this.empresasServicio
      .eliminar(empresa.id)
      .pipe(finalize(() => this.eliminando.set(false)))
      .subscribe({
        next: () => {
          this.empresaEliminar.set(null);
          this.toast.exito('Empresa eliminada correctamente.');
          this.cargarEmpresas(false);
        },
        error: (error: unknown) => this.toast.error(this.obtenerMensajeError(error)),
      });
  }

  protected cargarEmpresas(mostrarCarga = true): void {
    if (mostrarCarga) this.cargando.set(true);
    this.empresasServicio
      .listar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (empresas) => {
          this.empresas.set(empresas);
          const ultimaPagina = Math.max(1, Math.ceil(this.empresasFiltradas().length / this.elementosPorPagina));
          if (this.pagina() > ultimaPagina) this.pagina.set(ultimaPagina);
        },
        error: (error: unknown) => this.toast.error(this.obtenerMensajeError(error)),
      });
  }

  private obtenerMensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'No se pudo conectar con SIDE-API.';
      const mensajeApi = error.error?.message;
      if (typeof mensajeApi === 'string' && mensajeApi.length > 0) return mensajeApi;
      if (error.status === 403) return 'No tienes permisos para administrar empresas.';
    }
    return error instanceof Error ? error.message : 'No se pudo completar la operación.';
  }
}
