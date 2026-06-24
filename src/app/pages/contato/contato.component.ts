import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent {
  nome = '';
  email = '';
  mensagem = '';
  enviado = false;

  enviar() {
    if (this.nome && this.email && this.mensagem) {
      this.enviado = true;
    }
  }
}
