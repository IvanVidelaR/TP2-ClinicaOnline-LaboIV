import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { DatabaseService } from '../../services/database.service';
import { Subscription } from 'rxjs';
import { Turno } from '../../models/turno.model';
import { LoaderComponent } from "../../components/loader/loader.component";
import { DatePipe } from '@angular/common';
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
  
  ngOnDestroy()
  {
    this.subscriptions.unsubscribe();
  }

  emitirVolver() {
    this.volver.emit();
  }
}
