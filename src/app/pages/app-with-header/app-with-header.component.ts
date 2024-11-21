import { Component } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { slideInAnimation } from '../animations';

@Component({
  selector: 'app-app-with-header',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  animations: [
    slideInAnimation
  ],
  templateUrl: './app-with-header.component.html',
  styleUrl: './app-with-header.component.css'
})
export class AppWithHeaderComponent {
  constructor(private contexts: ChildrenOutletContexts) {}

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
