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
  protected habilitadoCargando: boolean = false;

  public ngOnInit(): void {
    this.traerUsuarios();
  }

  private async traerUsuarios() {
    try {
      this.loading = true;
      const response: any = await firstValueFrom(
        this.databaseService.getDocument('usuarios')
      );

      response.forEach((usuario: Usuario) => {
        this.usuarios.push(usuario);
      });
    } catch (error: any) {
      console.log(
        'Error al traer productos del listado de productos: ' + error.message
      );
    } finally {
      this.loading = false;
    }
  }

  protected async cambiarHabilitadoEspecialista(usuario: Usuario) {
    try
    {
      this.habilitadoCargando = true;
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
      this.habilitadoCargando = false;
    }
    
  }
}
