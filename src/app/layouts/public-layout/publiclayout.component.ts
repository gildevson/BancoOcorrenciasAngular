import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../pages/header/header.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './publiclayout.component.html',
  styleUrls: ['./publiclayout.component.css']
})
export class PubliclayoutComponent {}
