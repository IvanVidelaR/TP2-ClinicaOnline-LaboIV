import { Component, inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogUsuario } from '../../../models/logUsuario.model';
import { DatabaseService } from '../../../services/database.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-log-usuarios',
  standalone: true,
  imports: [DatePipe],
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
      logs.forEach((log: any) => {
        log.fecha = this.databaseService.convertTimestampToDate(log.fecha);
        this.logsUsuarios.push(log);
      });
      this.loading = false;
    });
    this.subscriptions.add(logsUsuariosSub);
  }
}
