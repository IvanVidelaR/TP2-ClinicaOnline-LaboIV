import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '@angular/fire/auth';
import { toast } from 'ngx-sonner';
import { DropdownMenuComponent } from "../dropdown-menu/dropdown-menu.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, DropdownMenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  
  private authenticationService = inject(AuthenticationService);
  protected user? : User | null;

  ngOnInit(): void {
    this.authenticationService.getCurrentUser().subscribe((user: User | null) => {
      this.user = user;
    });
  }
}
