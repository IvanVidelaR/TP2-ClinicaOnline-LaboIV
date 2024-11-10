import { Component, inject, OnInit } from '@angular/core';
import { LoaderComponent } from "../../components/loader/loader.component";
import { DatabaseService } from '../../services/database.service';
import { Especialidad } from '../../models/especialidad.model';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { Especialista } from '../../models/especialista.model';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent implements OnInit{
  private databaseService = inject(DatabaseService);
  protected especialidades: Especialidad[] = [];
  protected especialistas: Especialista[] = [];
  protected especialistasEspecialidad: Especialista[] = [];
  protected especialidadSeleccionada: string = '';
  protected loading: boolean = false;
  
  ngOnInit(): void {
    this.traerEspecialidades();
  }

  async traerEspecialidades()
  {
    try
    {
      this.loading = true;
      this.especialidades = await firstValueFrom(this.databaseService.getDocument('especialidades')); 
      const usuarios: any = await firstValueFrom(this.databaseService.getDocument('usuarios'));
      this.especialistas = usuarios.filter((usuario: any) => usuario.perfil == 'especialista');
      console.log(this.especialistas);
    }
    catch (error)
    {
      console.log(error);
    }
    finally
    {
      this.loading = false;
    }
  }

  seleccionarEspecialidad(tipoEspecialidad : string)
  {
    this.especialistasEspecialidad = [];

    this.especialistas.forEach((especialista: Especialista) => {
      this.especialidadSeleccionada = tipoEspecialidad;
      if (especialista.especialidad.includes(tipoEspecialidad)) {
        this.especialistasEspecialidad.push(especialista);
      }
    });

    
  }
}
