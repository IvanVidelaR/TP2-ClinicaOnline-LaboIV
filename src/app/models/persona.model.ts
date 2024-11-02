import { PersonaCredenciales } from "./personaCredenciales.model";

export interface Persona extends PersonaCredenciales{
    nombre: string,
    apellido: string,
    edad: number | null,
    dni: number | null,
}