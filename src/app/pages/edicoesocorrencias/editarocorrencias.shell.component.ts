import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-edicoes-ocorrencias-shell',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './edicoesocorrencias.shell.component.html',
  styleUrls: ['./edicoesocorrencias.shell.component.css']
})
export class EdicoesOcorrenciasShellComponent {}
