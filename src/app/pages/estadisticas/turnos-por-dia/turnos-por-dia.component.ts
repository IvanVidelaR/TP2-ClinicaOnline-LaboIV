import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../../../services/database.service';
import Chart, {ChartType} from 'chart.js/auto';
import { Turno } from '../../../models/turno.model';
import { LoaderComponent } from "../../../components/loader/loader.component";
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-turnos-por-dia',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './turnos-por-dia.component.html',
  styleUrl: './turnos-por-dia.component.css'
})
export class TurnosPorDiaComponent implements OnInit, OnDestroy{

  private databaseService = inject(DatabaseService);
  private subscriptions = new Subscription();
  protected loading: boolean = false;

  ngOnInit(): void {
    this.cargarDataTurnos();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  cargarDataTurnos()
  {
    this.loading = true;
    const turnosSub = this.databaseService.getDocument('turnos').subscribe((turnos: any[]) => {
      let contadorTurnosPorDia: Record<string, number> = {
        'Lunes': 0,
        'Martes': 0,
        'Miércoles': 0,
        'Jueves': 0,
        'Viernes': 0,
        'Sábado': 0
      }

      turnos.forEach((turno: any) => {
        turno.hora = this.databaseService.convertTimestampToDate(turno.hora)

        let diaSemanaNum: number = (turno.hora).getDay();
        let diaSemanaString: string = (Object.keys(contadorTurnosPorDia))[diaSemanaNum - 1];

        contadorTurnosPorDia[diaSemanaString] = (contadorTurnosPorDia[diaSemanaString] || 0) + 1;
      });

      const polarAreaChart = document.getElementById('polarAreaChart') as HTMLCanvasElement;

      new Chart(polarAreaChart, {
        type: 'polarArea' as ChartType,
        data: {
          labels: Object.keys(contadorTurnosPorDia),
          datasets: [
            {
              data: Object.values(contadorTurnosPorDia)
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { 
              display: true,
              labels: {
                font: {
                  size: 20 
                }
              }
            },
            tooltip: { enabled: true }
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 18
                },
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 18 
                }
              }
            }
          }
        }
      });

      this.loading = false;
    })

    this.subscriptions.add(turnosSub);
  }

  descargarPDFTurnos()
  {
    const pdf = new jsPDF();
    const fechaActual = new Date().toLocaleString();
    const logoUrl = 'banners/logo.png'; 
    const margen = 20; 
  
    pdf.addImage(logoUrl, 'PNG', margen, 10, 20, 20);
  
    const centroX = 105;
    pdf.setFontSize(20);
    pdf.setFont('times', 'bold'); 
    pdf.text('Cantidad de turnos por día', centroX, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('times', 'normal'); 
  
    pdf.setFontSize(10);
    pdf.setFont('times', 'normal');  
    pdf.text(`Emisión: ${fechaActual}`, 200, 28, { align: 'right' });
  
    pdf.setLineWidth(0.5);
    pdf.line(10, 40, 200, 40); 

    const polarAreaChart = document.getElementById('polarAreaChart') as HTMLCanvasElement;
    const imgData = polarAreaChart.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 55, 50, 100, 100);
  
    pdf.save(`Cantidad-de-turnos-por-dia.pdf`);
  }
}
