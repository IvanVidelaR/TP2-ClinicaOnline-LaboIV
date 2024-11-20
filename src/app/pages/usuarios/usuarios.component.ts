import { Component, inject, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  protected loading = false;
  private databaseService = inject(DatabaseService);
  protected usuarios: Array<Usuario> = [];
  protected usuarioLoading: { [email: string]: boolean} = {};

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


}
