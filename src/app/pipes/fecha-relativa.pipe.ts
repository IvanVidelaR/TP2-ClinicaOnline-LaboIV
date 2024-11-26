import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'fechaRelativa',
  standalone: true,
})
export class FechaRelativaPipe implements PipeTransform {

  private datePipe: DatePipe;

  constructor() {
    this.datePipe = new DatePipe('en-US');
  }

  transform(value: Date | string, format: string = 'mediumDate'): string {
    const ahora = new Date();
    const fecha = new Date(value);
    const diferenciaMilisegundos = ahora.getTime() - fecha.getTime();

    const segundos = Math.floor(diferenciaMilisegundos / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    const fechaFormateada: string | null = this.datePipe.transform(fecha, format);

    let fechaRelativa : string = '';
    if (dias > 0)
    {
      fechaRelativa = `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    }
    else if
    (horas > 0)
    {
      fechaRelativa = `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    }
    else if (minutos > 0)
    {
      fechaRelativa = `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    }
    else
    {
      fechaRelativa = 'Ahora';
    }

    return `${fechaFormateada} (${fechaRelativa})`;
  }
}
