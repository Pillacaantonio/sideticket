import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastServicio } from '../../../../compartido/servicios/toast.servicio';
import { EstadoTicket, FiltroTicket, PrioridadTicket, Ticket } from '../../modelos/ticket.modelo';
import { TicketsServicio } from '../../servicios/tickets.servicio';

@Component({
  selector: 'app-tickets-administrador',
  imports: [FormsModule],
  templateUrl: './tickets-administrador.html',
  styleUrl: './tickets-administrador.css',
})
export class TicketsAdministrador implements OnInit {
  private readonly ticketsServicio = inject(TicketsServicio);
  private readonly toast = inject(ToastServicio);

  protected readonly tickets = signal<Ticket[]>([]);
  protected readonly cargando = signal(true);
  protected readonly filtro = signal<FiltroTicket>('Todos');
  protected readonly menuTicket = signal<number | null>(null);
  protected readonly ticketRespuesta = signal<Ticket | null>(null);
  protected readonly guardandoRespuesta = signal(false);
  protected respuesta = '';
  protected estadoSeleccionado: EstadoTicket = 'Nuevo';
  protected prioridadSeleccionada: PrioridadTicket = 'Media';
  protected asignadoA = '';

  protected readonly estados: EstadoTicket[] = ['Nuevo', 'En proceso', 'Resuelto'];
  protected readonly filtros: FiltroTicket[] = ['Todos', ...this.estados];
  protected readonly ticketsFiltrados = computed(() => {
    const filtro = this.filtro();
    return filtro === 'Todos' ? this.tickets() : this.tickets().filter((ticket) => ticket.estado === filtro);
  });

  ngOnInit(): void {
    this.ticketsServicio.listar().subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.toast.error('No se pudieron cargar los tickets.');
      },
    });
  }

  protected cantidad(filtro: FiltroTicket): number {
    return filtro === 'Todos'
      ? this.tickets().length
      : this.tickets().filter((ticket) => ticket.estado === filtro).length;
  }

  protected seleccionarFiltro(filtro: FiltroTicket): void {
    this.filtro.set(filtro);
    this.menuTicket.set(null);
  }

  protected alternarMenu(id: number): void {
    this.menuTicket.update((actual) => (actual === id ? null : id));
  }

  protected cambiarEstado(ticket: Ticket, estado: EstadoTicket): void {
    if (ticket.estado === estado) {
      this.menuTicket.set(null);
      return;
    }

    this.ticketsServicio.cambiarEstado(ticket.id, estado).subscribe({
      next: (actualizado) => {
        this.tickets.update((tickets) => tickets.map((item) => (item.id === actualizado.id ? actualizado : item)));
        this.menuTicket.set(null);
        this.toast.exito(`Ticket #${ticket.id} cambiado a ${estado.toLowerCase()}.`);
      },
      error: () => this.toast.error('No se pudo cambiar el estado del ticket.'),
    });
  }

  protected abrirRespuesta(ticket: Ticket): void {
    this.menuTicket.set(null);
    this.respuesta = '';
    this.estadoSeleccionado = ticket.estado;
    this.prioridadSeleccionada = ticket.prioridad;
    this.asignadoA = '';
    this.ticketRespuesta.set(ticket);
  }

  protected usarRespuestaRapida(texto: string): void {
    this.respuesta = texto;
  }

  protected cerrarRespuesta(): void {
    if (!this.guardandoRespuesta()) this.ticketRespuesta.set(null);
  }

  protected enviarRespuesta(): void {
    const ticket = this.ticketRespuesta();
    if (!ticket || !this.respuesta.trim()) {
      this.toast.aviso('Escribe una respuesta antes de enviarla.');
      return;
    }

    this.guardandoRespuesta.set(true);
    this.ticketsServicio.responder(ticket.id, this.respuesta).subscribe({
      next: () => {
        this.actualizarTicketDesdeModal(ticket.id);
        this.guardandoRespuesta.set(false);
        this.ticketRespuesta.set(null);
        this.toast.exito(`Respuesta enviada al ticket #${ticket.id}.`);
      },
      error: () => {
        this.guardandoRespuesta.set(false);
        this.toast.error('No se pudo enviar la respuesta.');
      },
    });
  }

  protected registrarNotaInterna(): void {
    const ticket = this.ticketRespuesta();
    if (!ticket || !this.respuesta.trim()) {
      this.toast.aviso('Escribe una nota antes de guardarla.');
      return;
    }

    this.actualizarTicketDesdeModal(ticket.id);
    this.ticketRespuesta.set(null);
    this.toast.exito(`Nota interna guardada en el ticket #${ticket.id}.`);
  }

  private actualizarTicketDesdeModal(id: number): void {
    this.tickets.update((tickets) => tickets.map((ticket) => ticket.id === id
      ? { ...ticket, estado: this.estadoSeleccionado, prioridad: this.prioridadSeleccionada, sinLeer: false }
      : ticket));
  }

  protected etiquetaFiltro(filtro: FiltroTicket): string {
    return filtro === 'Todos' ? 'Todos' : filtro === 'Nuevo' ? 'Nuevos' : filtro === 'Resuelto' ? 'Resueltos' : filtro;
  }
}
