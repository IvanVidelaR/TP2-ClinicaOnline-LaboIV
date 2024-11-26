import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../../../services/database.service';
import Chart, {ChartType} from 'chart.js/auto';
import { Turno } from '../../../models/turno.model';
import { LoaderComponent } from "../../../components/loader/loader.component";
import { jsPDF } from "jspdf";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-turnos-finalizados',
  standalone: true,
  imports: [LoaderComponent, FormsModule, CommonModule],
  templateUrl: './turnos-finalizados.component.html',
  styleUrl: './turnos-finalizados.component.css'
})
export class TurnosFinalizadosComponent implements OnInit, OnDestroy{

  private databaseService = inject(DatabaseService);
  private subscriptions = new Subscription();
  protected loading: boolean = false;
  protected fechaInicio: string = '';
  protected fechaFin: string = '';
  protected turnosCompletos: Turno[] = []
  protected turnosFiltrados: Turno[] = [];
  private chartInstance: Chart | null = null;

  ngOnInit(): void {
    this.cargarDataTurnos();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  filtrarTurnos() {
    if (this.fechaInicio == '' && this.fechaFin == '')
    {
      this.turnosFiltrados = this.turnosCompletos; 
    }
    else
    {
      this.turnosFiltrados = this.turnosCompletos.filter((turno: Turno) => {
        let fechaInicioDate = new Date(this.fechaInicio);
        let fechaFinDate = new Date(this.fechaFin);
        let fechaTurno = new Date(turno.hora);
        
        if (this.fechaFin == '')
        {
          return (fechaTurno >= fechaInicioDate);  
        }
        else if (this.fechaInicio == '')
        {
          return (fechaTurno <= fechaFinDate);
        }
        else
        {
          return (fechaTurno >= fechaInicioDate && fechaTurno <= fechaFinDate); 
        }
      });
    }
  
    this.realizarGrafico(this.turnosFiltrados);
  }

  cargarDataTurnos() {
    this.loading = true;
  
    const turnosSub = this.databaseService.getDocument('turnos').subscribe((turnos: any[]) => {
      const turnosProcesados: any[] = [];
  
      turnos.forEach((turno: any, index: number) => {
        turno.hora = this.databaseService.convertTimestampToDate(turno.hora);
  
        this.databaseService.getDocumentById('usuarios', turno.especialistaEmail).subscribe((usuario: Usuario) => {
          turno.especialistaNombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
          turnosProcesados.push(turno);
  
          if (turnosProcesados.length === turnos.length) {
            this.turnosCompletos = turnosProcesados;
            this.realizarGrafico(this.turnosCompletos); 
            this.loading = false; 
          }
        });
      });
    });
  
    this.subscriptions.add(turnosSub);
  }
  

  realizarGrafico(turnos: Turno[]) {
    let contadorTurnosEspecialistaLapso: Record<string, number> = {};
  
    turnos.forEach((turno: Turno) => {
      if (turno.estado == 'realizado')
      {
        contadorTurnosEspecialistaLapso[turno.especialistaNombreCompleto!] = (contadorTurnosEspecialistaLapso[turno.especialistaNombreCompleto!] || 0) + 1;
      }
    });
  
    const pieChart = document.getElementById('pieChart') as HTMLCanvasElement;
  
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  
    this.chartInstance = new Chart(pieChart, {
      type: 'pie' as ChartType,
      data: {
        labels: Object.keys(contadorTurnosEspecialistaLapso),
        datasets: [
          {
            data: Object.values(contadorTurnosEspecialistaLapso),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                size: 20,
              },
            },
          },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 18,
              },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 18,
              },
            },
          },
        },
      },
    });
  
  }

  descargarPDFTurnos()
  {
    const pdf = new jsPDF();
    const fechaActual = new Date().toLocaleString();
    const fechaInicio = this.fechaInicio != '' ? new Date(this.fechaInicio).toLocaleDateString() : '***';
    const fechaFin = this.fechaFin != '' ? new Date(this.fechaFin).toLocaleDateString() : '***';
    const logoUrl = 'banners/logo.png'; 
    const margen = 20; 
  
    pdf.addImage(logoUrl, 'PNG', margen, 10, 20, 20);
  
    const centroX = 105;
    pdf.setFontSize(20);
    pdf.setFont('times', 'bold'); 
    pdf.text(`Cantidad de turnos solicitados del ${fechaInicio} al ${fechaFin}`, centroX, 38, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('times', 'normal'); 
  
    pdf.setFontSize(10);
    pdf.setFont('times', 'normal');  
    pdf.text(`Emisión: ${fechaActual}`, 200, 28, { align: 'right' });
  
    pdf.setLineWidth(0.5);
    pdf.line(10, 40, 200, 40); 

    const doughnutChart = document.getElementById('doughnutChart') as HTMLCanvasElement;
    const imgData = doughnutChart.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 55, 50, 100, 100);
  
    pdf.save(`Cantidad-de-turnos-en-lapso-de-tiempo.pdf`);
  }
}
