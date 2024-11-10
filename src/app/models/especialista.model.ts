import { Disponibilidad } from "./disponibilidad.model"
import { Persona } from "./persona.model"

export interface Especialista extends Persona {
    especialidad: Array<string>,
    habilitado: boolean,
    disponibilidad: Disponibilidad[]
}