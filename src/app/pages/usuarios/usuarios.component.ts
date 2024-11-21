import { Component, inject, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HistorialClinicoComponent } from "../historial-clinico/historial-clinico.component";
import * as XLSX from 'xlsx';
import { toast } from 'ngx-sonner';
import { Turno } from '../../models/turno.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterLink, HistorialClinicoComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  protected loading = false;
  private databaseService = inject(DatabaseService);
  protected usuarios: Array<Usuario> = [];
  protected usuarioSeleccionado?: Usuario;
  protected usuarioLoading: { [email: string]: boolean} = {};
  protected historialClinico: boolean = false;

  public ngOnInit(): void {
    this.traerUsuarios();
  }

  private traerUsuarios() {
    this.loading = true;
    this.databaseService.getDocument('usuarios').subscribe({
      next: (response: Usuario[]) => {
        this.usuarios = response; 
        this.loading = false;
      },
      error: (error) => {
        console.log('Error al traer productos del listado de productos: ' + error.message);
        this.loading = false;
      }
    });
  }

  protected async cambiarHabilitadoEspecialista(usuario: Usuario, indice: number) {
    try
    {
      this.usuarioLoading[usuario.email] = true;
      await this.databaseService.updateDocumentField(
        'usuarios',
        usuario.email!,
        'habilitado',
        !usuario.habilitado
      );
      usuario.habilitado = !usuario.habilitado;
    }
    catch (error)
    {
      console.log(error);
    }
    finally
    {
      this.usuarioLoading[usuario.email] = false;
    }
  }

  descargarExcelDatosUsuarios() {
    const datos = this.usuarios.map((usuario: Usuario) => ({
      Perfil: usuario.perfil,
      Nombre: usuario.nombre,
      Apellido: usuario.apellido,
      Edad: usuario.edad,
      DNI: usuario.dni,
      Mail: usuario.email,
      'Imagen de Perfil': usuario.imagenDePerfil,
      'Obra Social': usuario.obraSocial || 'NO TIENE',
      'Imagen de Portada': usuario.segundaImagenDePerfil || 'NO TIENE',
      Especialidades: usuario.especialidad ? usuario.especialidad.join(', ') : 'TIENE',
      Habilitado: usuario.habilitado !== undefined ? (usuario.habilitado ? 'Sí' : 'No') : 'NO TIENE',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos de los usuarios');

    XLSX.writeFile(workbook, 'datosUsuarios.xlsx');
  }


  descargarExcelTurnosTomados(usuario: Usuario)
  {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let turnosTomados: Turno[] = [];

        const turnos: any = await firstValueFrom(this.databaseService.getDocument('turnos'))
        
        for (const turno of turnos) {
          if (turno.pacienteEmail === usuario.email) {
            turno.hora = this.databaseService.convertTimestampToDate(turno.hora);
            const especialista: Usuario = await firstValueFrom(
              this.databaseService.getDocumentById('usuarios', turno.especialistaEmail)
            );
            turno.especialistaNombreCompleto = especialista.nombre;
            turno.pacienteNombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
            turnosTomados.push(turno);
          }
        }

        const datos = turnosTomados.map((turno: Turno) => {
          const encuesta = turno.encuesta
            ? `Comentario: ${turno.encuesta.comentario || 'No tiene'}; Recomendación: ${turno.encuesta.recomendacion || 'No tiene'}; Respuesta: ${turno.encuesta.respuesta || 'No tiene'}; Tratamiento: ${turno.encuesta.tratamiento || 'No tiene'}`
            : 'NO TIENE';
        
          const datosDinamicos = turno.historiaClinica?.datosDinamicos
            ? turno.historiaClinica.datosDinamicos
              .map((dato: any) => `${dato.clave}: ${dato.valor}`)
              .join('; ')
            : 'NO TIENE';
        
          return {
            'Paciente': turno.pacienteNombreCompleto,
            'Especialista': turno.especialistaNombreCompleto,
            'Especialidad': turno.especialidad,
            'Fecha': turno.hora.toLocaleString(),
            'Estado': turno.estado,
            'Cancelado Por': turno.canceladoPor || 'NO TIENE',
            'Motivo de Cancelación': turno.estado === 'cancelado' ? turno.comentario : 'NO TIENE',
            'Motivo de Rechazo': turno.estado === 'rechazado' ? turno.comentario : 'NO TIENE',
            'Reseña': turno.estado === 'realizado' ? turno.comentario : 'NO TIENE',
            'Encuesta': encuesta,
            'Calificación': turno.calificacion || 'NO TIENE',
            'Altura (cm)': turno.historiaClinica?.altura || 'NO TIENE',
            'Peso (kg)': turno.historiaClinica?.peso || 'NO TIENE',
            'Temperatura (°C)': turno.historiaClinica?.temperatura || 'NO TIENE',
            'Presión (mmHg)': turno.historiaClinica?.presion || 'NO TIENE',
            'Datos Dinámicos': datosDinamicos,
          };
        });

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);

        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Turnos tomados');

        XLSX.writeFile(workbook, `turnosTomados-${usuario.nombre}_${usuario.apellido}.xlsx`);
        resolve('Éxito');
      }
      catch (error) {
        reject(error);
      }
      
    });

    toast.promise(promise, {
      loading: 'Descargando excel con los turnos tomados...',
      success: 'Turnos tomados descargados correctamente',
      error: 'Ocurrió un error al descargar los turnos tomados'
    });
  }

}
