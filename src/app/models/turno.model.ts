export interface Turno {
  id?: string
  hora: Date,
  especialistaEmail: string,
  pacienteEmail: string,
  especialidad: string,
  estado: string
  especialistaNombreCompleto?: string 
  pacienteNombreCompleto?: string 
  comentario?: string
}