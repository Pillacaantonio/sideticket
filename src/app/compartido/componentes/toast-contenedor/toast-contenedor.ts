import { Component, inject } from '@angular/core';
import { ToastServicio } from '../../servicios/toast.servicio';

@Component({
  selector: 'app-toast-contenedor',
  styleUrl: './toast-contenedor.css',
  templateUrl: './toast-contenedor.html',
})
export class ToastContenedor {
  protected readonly toastServicio = inject(ToastServicio);
}
