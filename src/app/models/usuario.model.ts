import { Persona } from "./persona.model";

export interface Usuario extends Persona{
    obraSocial: string | null,
    segundaImagenDePerfil: string | null,
    especialidad: Array<string> | null,
    habilitado: boolean
}