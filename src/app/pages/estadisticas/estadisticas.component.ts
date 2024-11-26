import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShadowEffectDirective } from '../../directives/shadow-effect.directive';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [RouterLink, ShadowEffectDirective],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent{

  protected botonesEstadisticas = [
    {
      imagen: '/estadisticas/logs-usuarios.png',
      titulo: 'Log de ingresos',
      mensaje: 'Registro detallado de los ingresos al sistema, incluyendo el usuario, el dia y el horario en que se realizó cada acceso.',
      routerLink: '/estadisticas/logs-ingresos',
      color: '#DF2935'
    },
    {
      imagen: '/estadisticas/turnos-por-especialidad.png',
      titulo: 'Turnos por especialidad',
      mensaje: 'Detalle de la cantidad de turnos asignados por especialidad médica, para identificar la demanda.',
      routerLink: '/estadisticas/turnos-por-especialidad',
      color: '#3772FF'
    },
    {
      imagen: '/estadisticas/turnos-por-dia.png',
      titulo: 'Turnos por día',
      mensaje: 'Estadísticas que muestran la distribución de turnos según los días de la semana, para saber la actividad.',
      routerLink: '/estadisticas/turnos-por-dia',
      color: '#AE8E1C'
    },
    {
      imagen: '/estadisticas/turnos-solicitados.png',
      titulo: 'Turnos solicitados',
      mensaje: 'Detalle de la cantidad de turnos solicitados a un médico dentro de un período de tiempo específico.',
      routerLink: '/estadisticas/turnos-solicitados',
      color: '#47E5BC'
    },
    {
      imagen: '/estadisticas/turnos-finalizados.png',
      titulo: 'Turnos finalizados',
      mensaje: 'Detalle de la cantidad de turnos finalizados por cada médico dentro de un período de tiempo específico.',
      routerLink: '/estadisticas/turnos-finalizados',
      color: '#3A1772'
    }
  ]
}
