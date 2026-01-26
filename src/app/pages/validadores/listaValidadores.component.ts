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
  // Ordenar: primeiro os que têm validadores, depois os demais
  bancos: BancoData[] = this.ordenarBancos(BANCOS_DATA);

  // Bancos separados para exibição
  bancosComValidadores: BancoData[] = [];
  bancosSemValidadores: BancoData[] = [];

  constructor() {
    this.bancosComValidadores = BANCOS_DATA
      .filter(b => b.validadores && b.validadores.length > 0)
      .sort((a, b) => a.nome.localeCompare(b.nome));

    this.bancosSemValidadores = BANCOS_DATA
      .filter(b => !b.validadores || b.validadores.length === 0)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  ordenarBancos(bancos: BancoData[]): BancoData[] {
    return [...bancos].sort((a, b) => {
      // Primeiro critério: bancos com validadores vêm primeiro
      const aTemValidador = a.validadores && a.validadores.length > 0;
      const bTemValidador = b.validadores && b.validadores.length > 0;

      if (aTemValidador && !bTemValidador) return -1;
      if (!aTemValidador && bTemValidador) return 1;

      // Segundo critério: bancos ativos vêm antes dos inativos
      if (a.ativo && !b.ativo) return -1;
      if (!a.ativo && b.ativo) return 1;

      // Terceiro critério: ordem alfabética
      return a.nome.localeCompare(b.nome);
    });
  }

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
