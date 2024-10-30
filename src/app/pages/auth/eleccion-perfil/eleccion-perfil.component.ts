import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../services/authentication.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-eleccion-perfil',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './eleccion-perfil.component.html',
  styleUrl: './eleccion-perfil.component.css'
})
export class EleccionPerfilComponent implements OnInit{
  
  private authenticationService = inject(AuthenticationService);
  protected user?: User | null;

  ngOnInit(): void {
    this.authenticationService.getCurrentUser().subscribe((user: User | null) => {
      this.user = user;
    });
  }

}
