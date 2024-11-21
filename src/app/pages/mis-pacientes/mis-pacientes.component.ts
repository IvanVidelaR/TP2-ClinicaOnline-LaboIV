import { Component, inject, OnInit } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '@angular/fire/auth';
import { DatabaseService } from '../../services/database.service';
import { Turno } from '../../models/turno.model';
import { HistorialClinicoComponent } from "../historial-clinico/historial-clinico.component";
import { LoaderComponent } from "../../components/loader/loader.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mis-pacientes',
  standalone: true,
  imports: [HistorialClinicoComponent, LoaderComponent],
  templateUrl: './mis-pacientes.component.html',
  styleUrl: './mis-pacientes.component.css'
})
export class MisPacientesComponent implements OnInit{
  protected historialClinico: boolean = false;
  protected pacienteSeleccionado?: Usuario;
  private authenticationService = inject(AuthenticationService);
  private databaseService = inject(DatabaseService);
  private pacientesMailsAtendidosEspecialista: string[] = [];
  protected pacientesAtendidosEspecialista: Usuario[] = [];
  private subscriptions: Subscription = new Subscription();
  protected user?: User | null;
  protected loading: boolean = false; 

  ngOnInit(): void {
    this.loading = true;
    const authSub = this.authenticationService.getCurrentUser().subscribe((user: User | null) => {
      this.user = user;
      const turnosSub = this.databaseService.getDocument('turnos').subscribe((turnos: Turno[]) => {
        turnos.forEach((turno: Turno) => { 
          if (turno.especialistaEmail == user?.email && turno.historiaClinica)
          {
            if (!this.pacientesMailsAtendidosEspecialista.includes(turno.pacienteEmail)) {
              this.pacientesMailsAtendidosEspecialista.push(turno.pacienteEmail);
            }
          }
        })
        this.pacientesMailsAtendidosEspecialista.forEach((pacienteEmail) => {
          const usuarioSub = this.databaseService.getDocumentById('usuarios', pacienteEmail).subscribe((paciente: Usuario) => this.pacientesAtendidosEspecialista.push(paciente));
          this.subscriptions.add(usuarioSub);
        })
        this.loading = false;
      });
      this.subscriptions.add(turnosSub)
    });

    this.subscriptions.add(authSub)
  }

  ngOnDestroy()
  {
    this.subscriptions.unsubscribe();
  }
}
