import { Encuesta } from "./encuesta.model"

export interface Turno {
  id?: string
  hora: Date,
  especialistaEmail: string,
  pacienteEmail: string,
  especialidad: string,
  estado: 'pendiente' | 'cancelado' | 'realizado' | 'rechazado' | 'aceptado'
  canceladoPor?: 'paciente' | 'administrador' | 'especialista'
  especialistaNombreCompleto?: string 
  pacienteNombreCompleto?: string 
  comentario?: string,
  disabled?: boolean
  encuesta?: Encuesta,
  calificacion?: number,
  historiaClinica?: any;
}