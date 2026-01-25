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

  getTipoCnab(banco: BancoData): string {
    if (!banco.validadores || banco.validadores.length === 0) return '';
    const tipos = banco.validadores.map(v => {
      if (v.nome.includes('400/444')) return 'CNAB400/444';
      if (v.nome.includes('400')) return 'CNAB400';
      if (v.nome.includes('240')) return 'CNAB240';
      return 'CNAB';
    });
    return [...new Set(tipos)].join(', ');
  }
}
