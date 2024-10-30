import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '@angular/fire/auth';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  
  protected authenticationService = inject(AuthenticationService);
  protected user? : User | null;

  ngOnInit(): void {
    this.authenticationService.getAuth().onAuthStateChanged((auth: User | null) => {
      this.user = auth;
    })
  }

  protected signOut()
  {
    const promise = new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          this.authenticationService.signOut().then(() => resolve(''));
        }, 1500);
      } catch (error) {
        reject();
      }
    });

    toast.promise(promise, {
      loading: 'Cerrando sesión...',
      success: 'Sesión cerrada.',
      error: 'ERROR - No se pudo cerrar sesión.'
    });
  }
}
