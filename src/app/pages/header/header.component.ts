import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  isMobile = false;
  menuOpen = false;
  isScrolled = false;
  dropdownOpen: string | null = null;
  searchLoading = false;

  constructor() {
    this.checkMobile();
    this.updateScrolled();
  }

  // ===== Responsivo =====
  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

  private checkMobile() {
    this.isMobile = window.innerWidth <= 900;
    if (!this.isMobile) {
      this.menuOpen = false;
    }
  }

  // ===== Menu Mobile =====
  toggleMenu() {
    this.menuOpen = !this.menuOpen;

    // ao abrir o menu no mobile, fecha dropdown (evita sobreposição)
    if (this.menuOpen && this.isMobile) {
      this.dropdownOpen = null;
    }
  }

  closeMenu() {
    this.menuOpen = false;
    this.dropdownOpen = null;
  }

  // ===== Scroll (header scrolled) =====
  @HostListener('window:scroll')
  onScroll() {
    this.updateScrolled();
  }

  private updateScrolled() {
    this.isScrolled = window.scrollY > 10;
  }

  // ===== Dropdown =====
  toggleDropdown(key: string) {
    this.dropdownOpen = this.dropdownOpen === key ? null : key;
  }

  closeDropdown() {
    this.dropdownOpen = null;
  }

  // fecha dropdown quando clicar fora (opcional, mas fica profissional)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // se clicou dentro de um elemento .dropdown, não fecha
    if (target.closest('.dropdown')) return;

    // senão fecha
    this.closeDropdown();
  }

  // ===== Busca =====
  onSearchClick() {
    // placeholder: futuramente você abre modal / input / rota de busca
    this.searchLoading = true;

    setTimeout(() => {
      this.searchLoading = false;
    }, 600);
  }

  // ===== Subnav =====
  onSubNavClick(event: Event, section: string) {
    event.preventDefault();

    // aqui você pode trocar "active" via estado (se quiser)
    // por enquanto só demo: rolar pra uma âncora se existir
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
