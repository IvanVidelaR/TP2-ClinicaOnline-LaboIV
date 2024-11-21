import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { DatabaseService } from '../../services/database.service';
import { Subscription } from 'rxjs';
import { Turno } from '../../models/turno.model';
import { LoaderComponent } from "../../components/loader/loader.component";
import { DatePipe } from '@angular/common';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  imports: [LoaderComponent, DatePipe],
  templateUrl: './historial-clinico.component.html',
  styleUrl: './historial-clinico.component.css'
})
export class HistorialClinicoComponent implements OnInit{
  
  @Input() usuario?: Usuario;
  @Input() mostrarResenia: boolean = false; 
  @Output() volver = new EventEmitter<void>();
  private databaseService = inject(DatabaseService);
  private subscriptions: Subscription = new Subscription();
  protected turnosMostrar: Turno[] = [];
  protected loading: boolean = false;
  
  ngOnInit(): void {
    this.loading = true;
    const turnosSubscription = this.databaseService.getDocument('turnos').subscribe((turnos: any) => {
      turnos.forEach((turno: any) => {
        if (turno.historiaClinica)
        {
          if (this.usuario!.email == turno.pacienteEmail)
            {
              turno.hora = this.databaseService.convertTimestampToDate(turno.hora);
              this.turnosMostrar.push(turno);
            }
        }
      })
      this.turnosMostrar.forEach((turno) => {
        const usuarioSubscription = this.databaseService.getDocumentById('usuarios', turno.especialistaEmail).subscribe((usuario: Usuario) => {
          turno.especialistaNombreCompleto = usuario.nombre + ' ' + usuario.apellido;
        });

        this.subscriptions.add(usuarioSubscription);
      })
      this.loading = false;
    });
    this.subscriptions.add(turnosSubscription);
  }
  
  descargarPDFHistoriaClinica() {
    const pdf = new jsPDF();
    const fechaActual = new Date().toLocaleString();
    const logoUrl = 'banners/logo.png'; 
    const margen = 20; 
  
    pdf.addImage(logoUrl, 'PNG', margen, 10, 20, 20);
  
    const centroX = 105;
    pdf.setFontSize(14);
    pdf.setFont('times', 'bold'); 
    pdf.text('Informe de Historia Clínica', centroX, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('times', 'normal'); 
    pdf.text(`${this.usuario?.nombre} ${this.usuario?.apellido}`, centroX, 30, { align: 'center' });
  

    pdf.setFontSize(10);
    pdf.setFont('times', 'normal');  
    pdf.text(`Emisión: ${fechaActual}`, 200, 20, { align: 'right' });
  
    pdf.setLineWidth(0.5);
    pdf.line(10, 40, 200, 40); 
  
    let yPosition = 50; 
    let turnoCount = 1;
    this.turnosMostrar.forEach((turno) => {
      if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
      }
  
      pdf.setFontSize(12);
      pdf.setFont('times', 'bold'); 
      pdf.text(`Turno #${turnoCount}`, 105, yPosition, { align: 'center' });
      yPosition += 10;
  
      pdf.setFontSize(10);
      pdf.setFont('times', 'normal'); 
      pdf.text(`Fecha: ${turno.hora.toLocaleString()}`, margen, yPosition);
      yPosition += 7;
      pdf.text(`Especialista: ${turno.especialistaNombreCompleto}`, margen, yPosition);
      yPosition += 7;
      pdf.text(`Especialidad: ${turno.especialidad}`, margen, yPosition);
      yPosition += 10;
  
      const historia = turno.historiaClinica;
      pdf.text(`Altura: ${historia?.altura || 'No disponible'} cm`, margen, yPosition);
      yPosition += 7;
      pdf.text(`Peso: ${historia?.peso || 'No disponible'} kg`, margen, yPosition);
      yPosition += 7;
      pdf.text(`Temperatura: ${historia?.temperatura || 'No disponible'} °C`, margen, yPosition);
      yPosition += 7;
      pdf.text(`Presión: ${historia?.presion || 'No disponible'} mmHg`, margen, yPosition);
      yPosition += 10;
  
      if (historia?.datosDinamicos && historia.datosDinamicos.length > 0) {
          historia.datosDinamicos.forEach((dato: any) => {
              if (dato.clave != '' && dato.valor != '') {
                  pdf.text(`${dato.clave}: ${dato.valor}`, margen, yPosition);
                  yPosition += 7;
              }
          });
      } 
  
      pdf.setLineWidth(0.2);
      pdf.line(10, yPosition, 200, yPosition);
      yPosition += 10;
  
      turnoCount++;
    });
  
    pdf.save(`Informe_Historia_Clinica_${this.usuario?.nombre}_${this.usuario?.apellido}.pdf`);
}

  ngOnDestroy()
  {
    this.subscriptions.unsubscribe();
  }

  emitirVolver() {
    this.volver.emit();
  }
}
