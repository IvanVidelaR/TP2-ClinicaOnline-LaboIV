import { Persona } from "./persona.model";

export interface Paciente extends Persona{
    obraSocial: string,
    segundaImagenDePerfil: Blob
}