import { Component, inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogUsuario } from '../../../models/logUsuario.model';
import { DatabaseService } from '../../../services/database.service';
import * as XLSX from 'xlsx'
import { FormatoDniPipe } from '../../../pipes/formato-dni.pipe';
import { FechaRelativaPipe } from '../../../pipes/fecha-relativa.pipe';

@Component({
  selector: 'app-log-usuarios',
  standalone: true,
  imports: [FormatoDniPipe, FechaRelativaPipe],
  templateUrl: './log-usuarios.component.html',
  styleUrl: './log-usuarios.component.css'
})
export class LogUsuariosComponent implements OnInit{
  private databaseService = inject(DatabaseService);
  private subscriptions = new Subscription();
  
  protected logsUsuarios: LogUsuario[] = [];
  protected loading: boolean = false;
  
  ngOnInit(): void {
    this.loading = true;
    const logsUsuariosSub = this.databaseService.getDocument('logs_usuarios').subscribe((logs) => {
      this.logsUsuarios = logs.map((log: any) => {
        log.fecha = this.databaseService.convertTimestampToDate(log.fecha);
        return log;
      }).sort((a: LogUsuario, b: LogUsuario) => {
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      });

      this.loading = false;
    });
    this.subscriptions.add(logsUsuariosSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  descargarExcelDatosLogs() {
    const datos = this.logsUsuarios.map((log: LogUsuario) => ({
      FechaDeIngreso: log.fecha.toLocaleString(),
      Perfil: log.usuario.perfil,
      Nombre: log.usuario.nombre,
      Apellido: log.usuario.apellido,
      Edad: log.usuario.edad,
      DNI: log.usuario.dni,
      Mail: log.usuario.email,
      'Imagen de Perfil': log.usuario.imagenDePerfil,
      'Obra Social': log.usuario.obraSocial || 'NO TIENE',
      'Imagen de Portada': log.usuario.segundaImagenDePerfil || 'NO TIENE',
      Especialidades: log.usuario.especialidad ? log.usuario.especialidad.join(', ') : 'TIENE',
      Habilitado: log.usuario.habilitado !== undefined ? (log.usuario.habilitado ? 'Sí' : 'No') : 'NO TIENE',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs ingresos al sistema');

    XLSX.writeFile(workbook, 'logsSistema.xlsx');
  }
}
