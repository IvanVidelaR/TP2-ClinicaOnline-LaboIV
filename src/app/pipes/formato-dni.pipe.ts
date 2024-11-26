import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoDni',
  standalone: true
})
export class FormatoDniPipe implements PipeTransform {
  transform(value: string | number | null): string {
    if (!value) return ''; 

    const dniStr = value.toString();

    if (dniStr.length !== 8 || isNaN(Number(dniStr))) {
      return dniStr;
    }

    const parte1 = dniStr.substring(0, 2);
    const parte2 = dniStr.substring(2, 5);
    const parte3 = dniStr.substring(5, 8);

    return `${parte1}.${parte2}.${parte3}`;
  }
}