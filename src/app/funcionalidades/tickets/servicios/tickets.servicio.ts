import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EstadoTicket, Ticket } from '../modelos/ticket.modelo';

@Injectable({ providedIn: 'root' })
export class TicketsServicio {
  private readonly tickets: Ticket[] = [
    { id: 1042, titulo: 'No puedo imprimir la factura', categoria: 'Facturación', tipo: 'Problema', antiguedad: 'hace 10 min', adjuntos: 2, empresa: 'Ferretería Los Andes', prioridad: 'Alta', estado: 'Nuevo', sinLeer: true, descripcion: 'Al presionar “Imprimir” en una factura emitida, la página se queda cargando y no aparece el PDF.', archivos: ['captura1.png', 'error.jpg'], ultimaRespuesta: 'Hola, ya estamos revisando el error. ¿Te aparece con todas las facturas o solo con una?' },
    { id: 1041, titulo: 'Agregar filtro por fecha en reportes', categoria: 'Reportes', tipo: 'Mejora', antiguedad: 'hace 2 h', adjuntos: 1, empresa: 'Botica Central', prioridad: 'Baja', estado: 'Nuevo', sinLeer: false, descripcion: 'Necesitamos filtrar el reporte de ventas usando un rango de fechas personalizado.', archivos: ['reporte-actual.png'] },
    { id: 1039, titulo: 'El botón Guardar no responde', categoria: 'Clientes', tipo: 'Problema', antiguedad: 'ayer', adjuntos: 3, empresa: 'Distribuidora Sol', prioridad: 'Media', estado: 'En proceso', sinLeer: true, descripcion: 'Al editar los datos de un cliente, el botón Guardar no realiza ninguna acción.', archivos: ['cliente.png', 'consola.png', 'pasos.txt'], ultimaRespuesta: 'Estamos validando el formulario con la información enviada.' },
    { id: 1036, titulo: 'Cambiar el logo en la boleta', categoria: 'Configuración', tipo: 'Mejora', antiguedad: 'hace 2 días', adjuntos: 0, empresa: 'Panadería Luna', prioridad: 'Baja', estado: 'En proceso', sinLeer: false, descripcion: 'Solicitamos actualizar el logo que aparece en la cabecera de las boletas.', archivos: [] },
    { id: 1031, titulo: 'Error al exportar a Excel', categoria: 'Reportes', tipo: 'Problema', antiguedad: 'hace 3 días', adjuntos: 1, empresa: 'Librería Norte', prioridad: 'Media', estado: 'Resuelto', sinLeer: false, descripcion: 'La exportación del reporte mensual genera un archivo que Excel no puede abrir.', archivos: ['mensaje-excel.png'], ultimaRespuesta: 'El problema fue corregido. Por favor, vuelve a generar el archivo.' },
  ];

  listar(): Observable<Ticket[]> {
    return of(this.tickets.map((ticket) => ({ ...ticket })));
  }

  cambiarEstado(id: number, estado: EstadoTicket): Observable<Ticket> {
    const ticket = this.tickets.find((item) => item.id === id);
    if (!ticket) throw new Error('No se encontró el ticket seleccionado.');

    ticket.estado = estado;
    return of({ ...ticket });
  }

  responder(id: number, respuesta: string): Observable<boolean> {
    if (!this.tickets.some((ticket) => ticket.id === id) || !respuesta.trim()) {
      throw new Error('No se pudo registrar la respuesta.');
    }
    return of(true);
  }
}
