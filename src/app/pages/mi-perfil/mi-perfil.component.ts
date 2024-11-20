import { Component, inject, OnInit } from '@angular/core';
import { LoaderComponent } from "../../components/loader/loader.component";
import { DatabaseService } from '../../services/database.service';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '@angular/fire/auth';
import { Usuario } from '../../models/usuario.model';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { HistorialClinicoComponent } from "../historial-clinico/historial-clinico.component";
@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [LoaderComponent, RouterLink, HistorialClinicoComponent],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit{
  private databaseService = inject(DatabaseService);
  private authenticationService = inject(AuthenticationService);
  protected user?: User | null;
  protected loading: boolean = false; 
  protected usuario?: Usuario;
  protected historialClinico: boolean = false;

  ngOnInit(): void {
    this.authenticationService.getCurrentUser().subscribe((user: User | null) => {
      this.user = user;
      this.traerUsuario();
    });
  }

  async traerUsuario()
  {
    this.loading = true;
    try
    {
      if (this.user && this.user.email)
      {
        this.usuario = await firstValueFrom(this.databaseService.getDocumentById('usuarios', this.user.email));
      }
    }
    catch(error: any)
    {
      console.log('Error' + error);
    }
    finally
    {
      this.loading = false;
    }
  }
}
