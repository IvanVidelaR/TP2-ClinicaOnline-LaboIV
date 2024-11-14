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
import { Encuesta } from '../../models/encuesta.model';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [DatePipe, FormsModule, CommonModule],
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.css']
})
export class MisTurnosComponent implements OnDestroy {
  protected loading = false;
  protected databaseService = inject(DatabaseService);
  protected turnos: Array<Turno> = [];
  protected showModalCancelar: boolean = false;
  protected showModalMotivo: boolean = false;

  protected comentario: string = '';
  protected respuesta: boolean | null = null;
  protected tratamiento: boolean | null = null;
  protected recomendacion: boolean | null = null;

  private subscriptions: Subscription = new Subscription();
  private authenticationService = inject(AuthenticationService);

  protected user?: User | null;
  protected buscadorValue: string = '';

  protected estrellas = [{ valor: 5, enabled: false }, { valor: 4, enabled: false }, { valor: 3, enabled: false }, { valor: 2, enabled: false }, { valor: 1, enabled: false }];
  protected estrellaSeleccionada: any = null;

  ngOnInit(): void {
    const authSub = this.authenticationService.getCurrentUser().subscribe((user: User | null) => {
      this.user = user;
      this.traerTurnos();
    });
    this.subscriptions.add(authSub);
  }

  private traerTurnos(): void {
    this.loading = true;
    
    const turnosSub = this.databaseService.getDocument('turnos').subscribe({
      next: (turnos: any[]) => {
        this.turnos = turnos.map((turno) => {
          turno.hora = this.databaseService.convertTimestampToDate(turno.hora);
          return turno;
        });

        if (this.user?.displayName == 'paciente')
        {
          this.turnos = this.turnos.filter((turno: Turno) => turno.pacienteEmail == this.user?.email)
        }
        else if(this.user?.displayName == 'especialista')
        {
          this.turnos = this.turnos.filter((turno: Turno) => turno.especialistaEmail == this.user?.email)
        }
        
        this.turnos.forEach((turno) => {
          if (this.user?.displayName == 'paciente')
          {
            const especialistaSub = this.databaseService.getDocumentById('usuarios', turno.especialistaEmail).subscribe({
              next: (especialista: Especialista) => {
                turno.especialistaNombreCompleto = `${especialista.nombre} ${especialista.apellido}`;
              },
              error: (error) => {
                console.error(`Error al cargar especialista para el turno`, error);
              }
            });
            this.subscriptions.add(especialistaSub);
          }
          else if (this.user?.displayName == 'especialista')
          {
            const pacienteSub = this.databaseService.getDocumentById('usuarios', turno.pacienteEmail).subscribe({
              next: (paciente: Paciente) => {
                turno.pacienteNombreCompleto = `${paciente.nombre} ${paciente.apellido}`;
              },
              error: (error) => {
                console.error(`Error al cargar paciente para el turno`, error);
              }
            });
            this.subscriptions.add(pacienteSub);
          }
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
    if (this.comentario.length < 10) {
      toast.warning('Su comentario debe ser de más de 10 caracteres');
      return;
    } else if (this.comentario.length > 200) {
      toast.warning('Su comentario debe ser de menos de 200 caracteres');
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        await this.databaseService.updateDocumentFields('turnos', turno.id!, {
          estado: 'cancelado',
          comentario: this.comentario,
          canceladoPor: this.user?.displayName
        });
        resolve(true);
      } catch (error) {
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

  rechazarTurno(turno: Turno) {
    if (this.comentario.length < 10) {
      toast.warning('Su comentario debe ser de más de 10 caracteres');
      return;
    } else if (this.comentario.length > 200) {
      toast.warning('Su comentario debe ser de menos de 200 caracteres');
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        await this.databaseService.updateDocumentFields('turnos', turno.id!, {
          estado: 'rechazado',
          comentario: this.comentario,
          canceladoPor: this.user?.displayName
        });
        resolve(true);
      } catch (error) {
        reject();
      }
    });
      
    toast.promise(promise, {
      loading: 'Rechazando turno...',
      success: () => {
        return 'Turno rechazado con éxito';
      },
      error: () => {
        return 'Hubo un problema al rechazar el turno';
      }, 
    });
  }

  finalizarTurno(turno: Turno) {
    if (this.comentario.length < 10) {
      toast.warning('Su comentario debe ser de más de 10 caracteres');
      return;
    } else if (this.comentario.length > 200) {
      toast.warning('Su comentario debe ser de menos de 200 caracteres');
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        await this.databaseService.updateDocumentFields('turnos', turno.id!, {
          estado: 'realizado',
          comentario: this.comentario,
        });
        resolve(true);
      } catch (error) {
        reject();
      }
    });
      
    toast.promise(promise, {
      loading: 'Finalizando turno...',
      success: () => {
        return 'Turno finalizado cargado con éxito';
      },
      error: () => {
        return 'Hubo un problema al finalizar el turno';
      }, 
    });
  }

  aceptarTurno(turno: Turno)
  {
    const promise = new Promise(async (resolve, reject) => {
      try {
        await this.databaseService.updateDocumentField('turnos', turno.id!, 'estado', 'aceptado')
        resolve(true);
      } catch (error) {
        reject();
      }
    });
      
    toast.promise(promise, {
      loading: 'Aceptando turno...',
      success: () => {
        return 'Turno aceptado con éxito';
      },
      error: () => {
        return 'Hubo un problema al aceptar el turno';
      }, 
    });
  }
  
  completarEncuesta(turno: Turno) {
    
    if (this.respuesta == null || this.recomendacion == null || this.tratamiento == null || !this.comentario)
    {
      toast.warning('Debe completar todos los campos para mandar la encuesta');
      return;
    }
    else if (this.comentario.length < 10) {
      toast.warning('Su comentario en la encuesta debe ser de más de 10 caracteres');
      return;
    }
    else if (this.comentario.length > 200) {
      toast.warning('Su comentario en la encuesta debe ser de menos de 200 caracteres');
      return;
    } 
    
    const encuesta: Encuesta = {
      respuesta: this.respuesta,
      tratamiento: this.tratamiento,
      recomendacion: this.recomendacion,
      comentario: this.comentario,
    };

    const promise = new Promise(async (resolve, reject) => {
      try {
        await this.databaseService.updateDocumentField('turnos', turno.id!, 'encuesta', encuesta)
        resolve(true);
      } catch (error) {
        reject();
      }
    });
      
    toast.promise(promise, {
      loading: 'Completando encuesta...',
      success: () => {
        return 'Encuesta completada con éxito. ¡Que tenga un buen día!';
      },
      error: () => {
        return 'Hubo un problema al completar la encuesta';
      }, 
    });
  }

  resetEncuesta() {
    this.comentario = '';
    this.respuesta = null;
    this.tratamiento = null;
    this.recomendacion = null;
  }
  
  completarCalificacion(turno: Turno) {
    if (!this.estrellaSeleccionada)
    {
      toast.warning('Coloque al menos una estrella :(');
      return;
    }
    
    if (this.estrellaSeleccionada)
    {
      const promise = new Promise(async (resolve, reject) => {
        try {
          await this.databaseService.updateDocumentField('turnos', turno.id!, 'calificacion', this.estrellaSeleccionada.valor)
          resolve(true);
        } catch (error) {
          reject();
        }
      });
        
      toast.promise(promise, {
        loading: 'Asignando calificación...',
        success: () => {
          return 'Calificación completada con éxito. ¡Que tenga un buen día!';
        },
        error: () => {
          return 'Hubo un problema al asignar calificación';
        }, 
      });
    }
  }

  deseleccionarEstrellas()
  {
    this.estrellas.map(estrella => estrella.enabled = false);
  }

  seleccionarEstrella(estrellaSeleccionada: any)
  {
    this.estrellaSeleccionada = estrellaSeleccionada;

    this.deseleccionarEstrellas()

    this.estrellas.map(estrella => {
      if (estrella.valor <= estrellaSeleccionada.valor)
      {
        estrella.enabled = true
      }
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); 
  }
}
