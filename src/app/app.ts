import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContenedor } from './compartido/componentes/toast-contenedor/toast-contenedor';

@Component({
  imports: [RouterOutlet, ToastContenedor],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
}
