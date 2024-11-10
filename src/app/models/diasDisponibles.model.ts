import { Turno } from "./turno.model";

export interface DiasDisponibles
{
  dia: Date,
  turnos: Turno[]
}