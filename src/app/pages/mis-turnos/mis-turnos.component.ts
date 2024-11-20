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
  styleUrls: ['./mis-turnos.component.css'],
})
export class MisTurnosComponent implements OnDestroy {
  protected loading = false;
  protected databaseService = inject(DatabaseService);
  protected turnos: Array<Turno> = [];
  protected turnosFiltrados: Array<Turno> = [];
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

  protected estrellas = [
    { valor: 5, enabled: false },
    { valor: 4, enabled: false },
    { valor: 3, enabled: false },
    { valor: 2, enabled: false },
    { valor: 1, enabled: false },
  ];
  protected estrellaSeleccionada: any = null;

  ngOnInit(): void {
    const authSub = this.authenticationService
      .getCurrentUser()
      .subscribe((user: User | null) => {
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

        if (this.user?.displayName == 'paciente') {
          this.turnos = this.turnos.filter(
            (turno: Turno) => turno.pacienteEmail == this.user?.email
          );
        } else if (this.user?.displayName == 'especialista') {
          this.turnos = this.turnos.filter(
            (turno: Turno) => turno.especialistaEmail == this.user?.email
          );
        }

        this.turnos.forEach((turno) => {
          if (this.user?.displayName == 'paciente') {
            const especialistaSub = this.databaseService
              .getDocumentById('usuarios', turno.especialistaEmail)
              .subscribe({
                next: (especialista: Especialista) => {
                  turno.especialistaNombreCompleto = `${especialista.nombre} ${especialista.apellido}`;
                },
                error: (error) => {
                  console.error(
                    `Error al cargar especialista para el turno`,
                    error
                  );
                },
              });
            this.subscriptions.add(especialistaSub);
          } else if (this.user?.displayName == 'especialista') {
            const pacienteSub = this.databaseService
              .getDocumentById('usuarios', turno.pacienteEmail)
              .subscribe({
                next: (paciente: Paciente) => {
                  turno.pacienteNombreCompleto = `${paciente.nombre} ${paciente.apellido}`;
                },
                error: (error) => {
                  console.error(
                    `Error al cargar paciente para el turno`,
                    error
                  );
                },
              });
            this.subscriptions.add(pacienteSub);
          }
        });

        this.filtrarTurnos();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al traer turnos:', error);
        this.loading = false;
      },
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
          canceladoPor: this.user?.displayName,
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
          canceladoPor: this.user?.displayName,
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

  historiaClinica = {
    altura: '',
    peso: '',
    temperatura: '',
    presion: '',
    datosDinamicos: [] as { clave: string; valor: string }[],
  };

  errores: any = {};
  formularioValido = false;

  resetFormulario() {
    this.historiaClinica = {
      altura: '',
      peso: '',
      temperatura: '',
      presion: '',
      datosDinamicos: [],
    };
    this.comentario = '';
    this.errores = {};
    this.formularioValido = false;
  }

  validarAltura() {
    const altura = +this.historiaClinica.altura;
    if (!altura) {
      this.errores.altura = 'La altura es obligatoria.';
    } else if (altura < 60 || altura > 250) {
      this.errores.altura = 'La altura debe estar entre 60 y 250 cm.';
    } else {
      delete this.errores.altura;
    }
    this.validarFormulario();
  }

  validarPeso() {
    const peso = +this.historiaClinica.peso;
    if (!peso) {
      this.errores.peso = 'El peso es obligatorio.';
    } else if (peso < 5 || peso > 300) {
      this.errores.peso = 'El peso debe estar entre 5 y 300 kg.';
    } else {
      delete this.errores.peso;
    }
    this.validarFormulario();
  }

  validarTemperatura() {
    const temperatura = +this.historiaClinica.temperatura;
    if (!temperatura) {
      this.errores.temperatura = 'La temperatura es obligatoria.';
    } else if (temperatura < 35 || temperatura > 42) {
      this.errores.temperatura = 'La temperatura debe estar entre 35°C y 42°C.';
    } else {
      delete this.errores.temperatura;
    }
    this.validarFormulario();
  }

  validarPresion() {
    const presion = +this.historiaClinica.presion;
    if (!presion) {
      this.errores.presion = 'La presión arterial es obligatoria.';
    } else if (presion < 80 || presion > 180) {
      this.errores.presion = 'La presión debe estar entre 80 y 180 mmHg.';
    } else {
      delete this.errores.presion;
    }
    this.validarFormulario();
  }

  validarComentario() {
    if (!this.comentario) {
      this.errores.comentario = 'El comentario es obligatorio.';
    } else if (this.comentario.length < 10 || this.comentario.length > 200) {
      this.errores.comentario =
        'El comentario debe tener entre 10 y 200 caracteres.';
    } else {
      delete this.errores.comentario;
    }
    this.validarFormulario();
  }

  validarFormulario() {
    this.formularioValido = Object.keys(this.errores).length === 0;
  }

  agregarDatoDinamico() {
    this.historiaClinica.datosDinamicos.push({ clave: '', valor: '' });
  }

  eliminarDatoDinamico(index: number) {
    this.historiaClinica.datosDinamicos.splice(index, 1);
  }

  finalizarTurno(turno: Turno) {
    if (
      !this.formularioValido ||
      this.historiaClinica.altura == '' ||
      this.historiaClinica.peso == '' ||
      this.historiaClinica.presion == '' ||
      this.historiaClinica.temperatura == '' ||
      this.comentario == ''
    ) {
      toast.warning('Debe completar todos los campos para finalizar el turno');
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        await this.databaseService.updateDocumentFields('turnos', turno.id!, {
          estado: 'realizado',
          comentario: this.comentario,
          historiaClinica: this.historiaClinica,
        });
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Finalizando turno...',
      success: 'Turno finalizado y cargado con éxito.',
      error: 'Hubo un problema al finalizar el turno.',
    });
  }

  aceptarTurno(turno: Turno) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        await this.databaseService.updateDocumentField(
          'turnos',
          turno.id!,
          'estado',
          'aceptado'
        );
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
    if (
      this.respuesta == null ||
      this.recomendacion == null ||
      this.tratamiento == null ||
      !this.comentario
    ) {
      toast.warning('Debe completar todos los campos para mandar la encuesta');
      return;
    } else if (this.comentario.length < 10) {
      toast.warning(
        'Su comentario en la encuesta debe ser de más de 10 caracteres'
      );
      return;
    } else if (this.comentario.length > 200) {
      toast.warning(
        'Su comentario en la encuesta debe ser de menos de 200 caracteres'
      );
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
        await this.databaseService.updateDocumentField(
          'turnos',
          turno.id!,
          'encuesta',
          encuesta
        );
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
    if (!this.estrellaSeleccionada) {
      toast.warning('Coloque al menos una estrella :(');
      return;
    }

    if (this.estrellaSeleccionada) {
      const promise = new Promise(async (resolve, reject) => {
        try {
          await this.databaseService.updateDocumentField(
            'turnos',
            turno.id!,
            'calificacion',
            this.estrellaSeleccionada.valor
          );
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

  deseleccionarEstrellas() {
    this.estrellas.map((estrella) => (estrella.enabled = false));
  }

  seleccionarEstrella(estrellaSeleccionada: any) {
    this.estrellaSeleccionada = estrellaSeleccionada;

    this.deseleccionarEstrellas();

    this.estrellas.map((estrella) => {
      if (estrella.valor <= estrellaSeleccionada.valor) {
        estrella.enabled = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  filtrarTurnos() {
    if (this.buscadorValue === '') {
      this.turnosFiltrados = this.turnos;
    } else {
      const buscadorValue = isNaN(+this.buscadorValue)
        ? this.buscadorValue.toLowerCase() 
        : this.buscadorValue;
  
      this.turnosFiltrados = this.turnos.filter((turno) => {
        return (
          (this.user?.displayName === 'paciente' &&
            turno.especialistaNombreCompleto
              ?.toLowerCase()
              .includes(buscadorValue)) ||
          turno.especialistaNombreCompleto
            ?.toLowerCase()
            .includes(buscadorValue) ||
          turno.especialidad?.toLowerCase().includes(buscadorValue) ||
          (this.user?.displayName === 'especialista' &&
            turno.pacienteNombreCompleto
              ?.toLowerCase()
              .includes(buscadorValue)) ||
          (turno.historiaClinica &&
            String(turno.historiaClinica.altura).includes(buscadorValue)) ||
          (turno.historiaClinica &&
            String(turno.historiaClinica.peso).includes(buscadorValue)) || 
          (turno.historiaClinica &&
            String(turno.historiaClinica.temperatura).includes(buscadorValue)) || 
          (turno.historiaClinica &&
            String(turno.historiaClinica.presion).includes(buscadorValue)) ||
          (turno.historiaClinica &&
            turno.historiaClinica.datosDinamicos &&
            turno.historiaClinica.datosDinamicos.some((dato: any) =>
              (dato.clave?.toLowerCase().includes(buscadorValue))
            )
          )
        );
      });
    }
  }
  
  
}
