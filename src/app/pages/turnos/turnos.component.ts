import { Component, inject, OnDestroy } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { Turno } from '../../models/turno.model';
import { Especialista } from '../../models/especialista.model';
import { Paciente } from '../../models/paciente.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';
import { User } from '@angular/fire/auth';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [DatePipe, FormsModule, CommonModule],
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css']
})
export class TurnosComponent implements OnDestroy {
  protected loading = false;
  protected databaseService = inject(DatabaseService);
  protected turnos: Array<Turno> = [];
  protected showModalCancelar: boolean = false;
  protected showModalMotivo: boolean = false;
  protected comentarioCancelacion: string = '';

  private subscriptions: Subscription = new Subscription();
  private authenticationService = inject(AuthenticationService);

  protected user?: User | null;
  protected buscadorValue: string = '';

  ngOnInit(): void {
    const authSub = this.authenticationService.getCurrentUser().subscribe((user: User | null) => {
      this.user = user;
    });
    this.subscriptions.add(authSub);
    this.traerTurnos();
  }

  private traerTurnos(): void {
    this.loading = true;
    
    const turnosSub = this.databaseService.getDocument('turnos').subscribe({
      next: (turnos: any[]) => {
        this.turnos = turnos.map((turno) => {
          turno.hora = this.databaseService.convertTimestampToDate(turno.hora);
          return turno;
        });

        this.turnos.forEach((turno) => {
          const especialistaSub = this.databaseService.getDocumentById('usuarios', turno.especialistaEmail).subscribe({
            next: (especialista: Especialista) => {
              turno.especialistaNombreCompleto = `${especialista.nombre} ${especialista.apellido}`;
            },
            error: (error) => {
              console.error(`Error al cargar especialista para el turno`, error);
            }
          });
          this.subscriptions.add(especialistaSub);

          const pacienteSub = this.databaseService.getDocumentById('usuarios', turno.pacienteEmail).subscribe({
            next: (paciente: Paciente) => {
              turno.pacienteNombreCompleto = `${paciente.nombre} ${paciente.apellido}`;
            },
            error: (error) => {
              console.error(`Error al cargar paciente para el turno`, error);
            }
          });
          this.subscriptions.add(pacienteSub);
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al traer turnos:', error);
        this.loading = false;
      }
    });
    this.subscriptions.add(turnosSub);
  }

  cancelarTurno(turno: Turno) {
    if (this.comentarioCancelacion.length < 10) {
      toast.warning('Su comentario debe ser de más de 10 caracteres');
      return;
    } else if (this.comentarioCancelacion.length > 200) {
      toast.warning('Su comentario debe ser de menos de 200 caracteres');
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        await this.databaseService.updateDocumentFields('turnos', turno.id!, {
          estado: 'cancelado',
          comentario: this.comentarioCancelacion,
          canceladoPor: this.user?.displayName
        });
        resolve(true);
      } catch (error) {
        console.error('Error al cancelar el turno:', error);
        reject();
      }
    });
      
    toast.promise(promise, {
      loading: 'Cancelando turno...',
      success: () => {
        return 'Turno cancelado con éxito';
      },
      error: () => {
        return 'Hubo un problema al cancelar el turno';
      }, 
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); 
  }
}
