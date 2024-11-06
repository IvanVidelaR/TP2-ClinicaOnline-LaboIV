import { Component, Input, inject, HostListener } from '@angular/core';
import { User } from '@angular/fire/auth';
import { toast } from 'ngx-sonner';
import { AuthenticationService } from '../../services/authentication.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown">
      <button class="dropdown-toggle-button" (click)="toggleMenu()">
        <img [src]="user?.photoURL" alt="userImage" [ngClass]="{'clicked-logo': isMenuOpen}">
      </button>
      <ul class="dropdown-menu" [ngStyle]="{'pointer-events': isMenuOpen ? 'auto' : 'none', 'opacity': isMenuOpen ? 1 : 0, 'transform': isMenuOpen ? 'translateY(0)' : 'translateY(-10px)'}">
        <li class="cuenta">
          <i class="fa-regular fa-user icon"></i>
          Profile
        </li>
        <li class="signOut" (click)="signOut()">
          <i class="fa-solid fa-right-from-bracket icon"></i>
          Sign out
        </li>
      </ul>
    </div>
  `,
  styles: `
    .dropdown {
      position: relative;
      display: inline-block;
    }

    .dropdown-toggle-button img {
      transition: transform 0.3s ease; 
    }

    .dropdown-toggle-button:hover img {
      transform: scale(1.1) rotate(15deg); 
    }

    .clicked-logo {
      transform: scale(1.1) rotate(15deg);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + .25rem);
      padding: 1rem 0;
      border-radius: .25rem;
      right: 0;
      background-color: white;
      border: 1px solid #ddd;
      box-shadow: 0px 10px 14px 5px rgba(163, 146, 225, 0.4);
      display: flex;
      flex-direction: column;
      list-style: none;
      width: auto;
      min-width: 170px;
      transition: opacity 150ms ease-in-out, transform 150ms ease-in-out;
    }

    .dropdown-toggle-button {
      background-color: var(--hover-secondary);
      color: #000;
      border-radius: 50px;
      padding: .5em 1em;
      border: none;
      cursor: pointer;
      font-family: "Inter", sans-serif;
      font-weight: 400;
      font-size: 1.05rem;
    }

    .dropdown-toggle-button img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 1px solid white;
      background-color: #ababb7;
      object-fit: cover;
    }

    .dropdown-toggle-button:hover {
      color: #000;
      background-color: var(--hover-primary);
    }

    .signOut, .cuenta {
      cursor: pointer;
    }

    .dropdown-menu li:hover {
      background-color: #E2E2DF;
    }

    .dropdown-menu li {
      display: flex;
      align-items: center;
      padding: 0 1rem;
      height: 50px;
    }

    .icon {
      margin-right: 10px;
    }
  `
})
export class DropdownMenuComponent {
  @Input() user?: User | null;
  
  private authenticationService = inject(AuthenticationService);
  
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  signOut() {
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

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.dropdown');
    if (!clickedInside) {
      this.isMenuOpen = false;
    }
  }
}
