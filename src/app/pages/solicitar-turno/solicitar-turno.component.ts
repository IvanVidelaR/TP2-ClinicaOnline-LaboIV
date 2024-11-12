import { Component, inject, OnInit } from '@angular/core';
import { LoaderComponent } from "../../components/loader/loader.component";
import { DatabaseService } from '../../services/database.service';
import { Especialidad } from '../../models/especialidad.model';
import { firstValueFrom, Subscription } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { Especialista } from '../../models/especialista.model';
import { DatePipe } from '@angular/common';
import { DiasDisponibles } from '../../models/diasDisponibles.model';
import { Turno } from '../../models/turno.model';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '@angular/fire/auth';
import { toast } from 'ngx-sonner';
import { Paciente } from '../../models/paciente.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [LoaderComponent, DatePipe],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent implements OnInit{
  private databaseService = inject(DatabaseService);
  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);

  protected especialidades: Especialidad[] = [];
  protected especialistas: Especialista[] = [];
  protected especialistasEspecialidad: Especialista[] = [];
  protected especialidadSeleccionada: string = '';
  protected especialistaSeleccionado: Especialista | null = null;
  protected loading: boolean = false;
  protected diasDisponibles: DiasDisponibles[] = [];
  protected turnoSeleccionado: Turno | null = null; 
  protected user?: User | null;
  
  protected pacientes: Paciente[] = [];
  protected pacienteSeleccionado: Paciente | null = null;

  protected turnos: Turno[] = [];
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    const authSub = this.authenticationService.getCurrentUser().subscribe((user: User | null) => {
      this.user = user;
      this.traerUsuarios();
      this.traerEspecialidades();
      this.traerTurnos();
    });
    this.subscriptions.add(authSub);
  }

  traerUsuarios() {
    this.loading = true;
    const usuariosSub = this.databaseService.getDocument('usuarios').subscribe({
      next: (usuarios: any) => {
        this.pacientes = usuarios.filter((usuario: any) => usuario.perfil === 'paciente');
        this.especialistas = usuarios.filter((usuario: any) => usuario.perfil === 'especialista');
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });
    this.subscriptions.add(usuariosSub);
  }
  
  traerTurnos() {
    this.loading = true;
    const turnosSub = this.databaseService.getDocument('turnos').subscribe({
      next: (turnos: any[]) => {
        this.turnos = turnos.map((turno) => {
          turno.hora = this.databaseService.convertTimestampToDate(turno.hora);
          return turno;
        });
        this.loading = false;
          
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });
    this.subscriptions.add(turnosSub);
  }
  
  traerEspecialidades() {
    this.loading = true;
    const especialidadesSub = this.databaseService.getDocument('especialidades').subscribe({
      next: (especialidades: Especialidad[]) => {
        this.especialidades = especialidades;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });
    this.subscriptions.add(especialidadesSub);
  }

  seleccionarEspecialidad(tipoEspecialidad : string)
  {
    this.especialistasEspecialidad = [];
    this.especialistaSeleccionado = null;
    this.turnoSeleccionado = null;

    this.especialidadSeleccionada = tipoEspecialidad;

    this.especialistas.forEach((especialista: Especialista) => {
      if (especialista.especialidad.includes(tipoEspecialidad)) {
        this.especialistasEspecialidad.push(especialista);
      }
    });
  }

  seleccionarEspecialista(especialista : Especialista)
  {
    this.especialistaSeleccionado = especialista;
    this.diasDisponibles = this.generateAvailableDatesAndTimes();
    this.turnoSeleccionado = null;
  }

  seleccionarPaciente(paciente: Paciente)
  {
    this.pacienteSeleccionado = paciente;
    this.especialidadSeleccionada = '';
    this.especialistaSeleccionado = null;
    this.turnoSeleccionado = null;
  }

  seleccionarTurno(turno: any)
  {
    this.turnoSeleccionado = turno;
  }

  generateAvailableDatesAndTimes() {
    const dias: DiasDisponibles[] = [];
    const hoy = new Date();
  
    for (let i = 0; i < 15; i++) {
      const dia = new Date(hoy);
      dia.setDate(hoy.getDate() + i);
  
      if (dia.getDay() !== 0) {
        dias.push({
          dia,
          turnos: this.generateTimesForDay(dia)
        });
      }
    }
  
    return dias;
  }
  
  generateTimesForDay(date: Date) {
    const turnos: Turno[] = [];
    
    let especialista = this.especialistaSeleccionado;
  
    const dayIndex = date.getDay(); 
    
    const schedule = especialista!.disponibilidad[dayIndex - 1];
  
    if (schedule) {
      const { horarioInicio, horarioFin } = schedule;
      const [startHour, startMinute] = horarioInicio.split(':').map(Number);
      const [endHour, endMinute] = horarioFin.split(':').map(Number);
  
      let currentTime = new Date(date);
      currentTime.setHours(startHour, startMinute, 0, 0);
  
      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);
      
      while (currentTime < endTime) {
        const horarioTurno: Date = new Date(currentTime);
        let existeTurno: boolean = false;

        this.turnos.forEach((turno: Turno) => {
          if ((horarioTurno.getTime() === turno.hora.getTime() && (turno.especialistaEmail == this.especialistaSeleccionado!.email || turno.pacienteEmail == this.pacienteSeleccionado?.email || turno.pacienteEmail == this.user!.email)) && (!(turno.canceladoPor == 'paciente')))
          {
            existeTurno = true;
          }
        })
        
        if (!existeTurno)
        {
          if (this.user?.displayName == 'administrador')
          {
            turnos.push({ hora: horarioTurno, especialistaEmail: this.especialistaSeleccionado!.email, pacienteEmail: this.pacienteSeleccionado!.email!, especialidad: this.especialidadSeleccionada, estado: 'pendiente'});
          }
          else
          {
            turnos.push({ hora: horarioTurno, especialistaEmail: this.especialistaSeleccionado!.email, pacienteEmail: this.user!.email!, especialidad: this.especialidadSeleccionada, estado: 'pendiente'});
          }
        }

        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
    }
  
    return turnos;
  }
  
  solicitarTurno()
  {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const generatedId = await this.databaseService.setDocument('turnos', this.turnoSeleccionado);

        if (generatedId)
        {
          await this.databaseService.updateDocumentField('turnos', generatedId, 'id', generatedId);
        }
        resolve('');
      } catch (error) {
        reject();
      }
    });

    toast.promise(promise, {
      loading: 'Agendando turno...',
      success: () => {
        this.router.navigateByUrl('/mi-perfil');
        return 'Turno agendado correctamente.'
      },
      error: 'ERROR - No se pudo agendar el turno.'
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); 
  }
}
