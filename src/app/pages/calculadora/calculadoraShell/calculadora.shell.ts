import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-calculadora-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <section class="calc-shell">
      <router-outlet></router-outlet>
    </section>
  `,
  styles: [`
    .calc-shell { padding: 24px; }
  `]
})
export class CalculadoraShellComponent {}
