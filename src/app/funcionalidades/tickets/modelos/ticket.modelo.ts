export type EstadoTicket = 'Nuevo' | 'En proceso' | 'Resuelto';
export type PrioridadTicket = 'Alta' | 'Media' | 'Baja';

export interface Ticket {
  id: number;
  titulo: string;
  categoria: string;
  tipo: string;
  antiguedad: string;
  adjuntos: number;
  empresa: string;
  prioridad: PrioridadTicket;
  estado: EstadoTicket;
  sinLeer: boolean;
  descripcion: string;
  archivos: string[];
  ultimaRespuesta?: string;
}

export type FiltroTicket = 'Todos' | EstadoTicket;
