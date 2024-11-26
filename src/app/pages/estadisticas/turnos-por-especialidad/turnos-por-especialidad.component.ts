import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../../../services/database.service';
import Chart, {ChartType} from 'chart.js/auto';
import { Turno } from '../../../models/turno.model';
import { LoaderComponent } from "../../../components/loader/loader.component";
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-turnos-por-especialidad',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './turnos-por-especialidad.component.html',
  styleUrl: './turnos-por-especialidad.component.css'
})
export class TurnosPorEspecialidadComponent implements OnInit, OnDestroy{

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
    const turnosSub = this.databaseService.getDocument('turnos').subscribe((turnos: Turno[]) => {
      let contadorTurnosPorEspecialidad: Record<string, number> = {}

      turnos.forEach((turno: Turno) => {
        contadorTurnosPorEspecialidad[turno.especialidad] = (contadorTurnosPorEspecialidad[turno.especialidad] || 0) + 1;
      });

      const barChart = document.getElementById('barChart') as HTMLCanvasElement;

      new Chart(barChart, {
        type: 'bar' as ChartType,
        data: {
          labels: Object.keys(contadorTurnosPorEspecialidad),
          datasets: [
            {
              label: 'Turnos por especialidad',
              data: Object.values(contadorTurnosPorEspecialidad)
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
    pdf.setFontSize(14);
    pdf.setFont('times', 'bold'); 
    pdf.text('Cantidad de turnos por especialidad', centroX, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('times', 'normal'); 
  

    pdf.setFontSize(10);
    pdf.setFont('times', 'normal');  
    pdf.text(`Emisión: ${fechaActual}`, 200, 20, { align: 'right' });
  
    pdf.setLineWidth(0.5);
    pdf.line(10, 40, 200, 40); 

    const barChart = document.getElementById('barChart') as HTMLCanvasElement;
    const imgData = barChart.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', margen, 50, 170, 90);
  
    pdf.save(`Cantidad-de-turnos-por-especialidad.pdf`);
  }
}
