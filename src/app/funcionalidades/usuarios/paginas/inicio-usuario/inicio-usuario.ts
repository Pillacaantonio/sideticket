import { Component } from '@angular/core';
import { CabeceraSesion } from '../../../../compartido/componentes/cabecera-sesion/cabecera-sesion';

@Component({
  imports: [CabeceraSesion],
  selector: 'app-inicio-usuario',
  styleUrl: './inicio-usuario.css',
  templateUrl: './inicio-usuario.html',
})
export class InicioUsuario {}
