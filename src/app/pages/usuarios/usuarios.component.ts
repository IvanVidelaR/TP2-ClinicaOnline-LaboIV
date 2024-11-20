import { Component, inject, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HistorialClinicoComponent } from "../historial-clinico/historial-clinico.component";
import * as XLSX from 'xlsx';

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

}
