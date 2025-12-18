import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NOTICIAS } from '../../data/noticias.data';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css']
})
export class NoticiasComponent {
  noticias = NOTICIAS;
}
