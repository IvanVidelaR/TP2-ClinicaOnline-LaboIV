import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoTurno',
  standalone: true
})
export class EstadoTurnoPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return ''; 

    const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    return `Turno ${capitalize(value)}`;
  }
}