import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BANCOS_DATA, BancoData } from '../../data/bancos.data';

@Component({
  selector: 'app-lista-validadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listaValidadores.component.html',
  styleUrl: './listaValidadores.component.css'
})
export class ListaValidadoresComponent {
  bancos: BancoData[] = BANCOS_DATA.filter(b => b.ativo !== false);
}
