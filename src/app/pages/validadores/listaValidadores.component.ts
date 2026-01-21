import { Component } from '@angular/core';
import { BANCOS_DATA, BancoData } from '../../data/bancos.data';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lista-validadores',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listaValidadores.component.html',
  styleUrls: ['./listaValidadores.component.css']
})
export class ListaValidadoresComponent {
  bancos: BancoData[] = BANCOS_DATA;
}
