import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';

import { AuthService } from '../../service/auth.service';
import { LoginUser } from '../../models/auth.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuOpen = false;
  dropdownOpen: string | null = null;
  isScrolled = false;
  isMobile = false;
  searchLoading = false;

  // ✅ NOVO: Estado do painel de organização
  organizePanelOpen = false;

  activeSubNav = 'processamento';

  // ✅ usuário logado para mostrar no header
  user$!: Observable<LoginUser | null>;

  private routerSubscription?: Subscription;
  private touchStartX = 0;
  private touchStartY = 0;
  private lockedScrollY = 0;
  private onTouchStartRef?: (e: TouchEvent) => void;
  private onTouchEndRef?: (e: TouchEvent) => void;

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.user$ = this.auth.user$;

    this.checkMobile();
    this.setupRouterListener();
    this.setupSwipeGestures();
    this.onScroll();
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();

    if (this.onTouchStartRef) document.removeEventListener('touchstart', this.onTouchStartRef);
    if (this.onTouchEndRef) document.removeEventListener('touchend', this.onTouchEndRef);

    this.unlockBodyScroll();
  }

  // ================================
  // RESPONSIVO
  // ================================
  @HostListener('window:resize')
  onResize(): void {
    const prev = this.isMobile;
    this.checkMobile();

    if (prev && !this.isMobile) {
      this.closeMenu();
    }
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth <= 900;
  }

  // ================================
  // SCROLL
  // ================================
  @HostListener('window:scroll')
  onScroll(): void {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    this.isScrolled = y > 50;
  }

  // ================================
  // MENU
  // ================================
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.dropdownOpen = null;

    if (this.menuOpen && this.isMobile) this.lockBodyScroll();
    else this.unlockBodyScroll();
  }

  closeMenu(): void {
    if (!this.menuOpen) return;
    this.menuOpen = false;
    this.dropdownOpen = null;
    this.unlockBodyScroll();
  }

  private lockBodyScroll(): void {
    this.lockedScrollY = window.scrollY || 0;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    const top = document.body.style.top;

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    if (top) {
      const y = Math.abs(parseInt(top, 10)) || this.lockedScrollY;
      window.scrollTo(0, y);
    }
  }

  // ================================
  // DROPDOWN
  // ================================
  toggleDropdown(dropdownId: string): void {
    this.dropdownOpen = this.dropdownOpen === dropdownId ? null : dropdownId;
  }

  closeDropdown(): void {
    this.dropdownOpen = null;
  }

  // ================================
  // ROUTER
  // ================================
  private setupRouterListener(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(ev => ev instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  // ================================
  // SUB NAV
  // ================================
  onSubNavClick(event: Event, section: string): void {
    event.preventDefault();
    this.activeSubNav = section;
  }

  onSubNavScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const maxScroll = el.scrollWidth - el.clientWidth;

    el.classList.toggle('scroll-end', el.scrollLeft >= maxScroll - 10);
    el.classList.toggle('scroll-start', el.scrollLeft <= 10);
  }

  // ================================
  // BUSCA
  // ================================
  onSearchClick(): void {
    if (this.searchLoading) return;
    this.searchLoading = true;

    setTimeout(() => {
      this.searchLoading = false;
    }, 500);
  }

  // ================================
  // ✅ ORGANIZAR OCORRÊNCIAS (NOVO)
  // ================================
  onOrganizeClick(): void {
    this.organizePanelOpen = !this.organizePanelOpen;

    console.log('Organizar ocorrências clicado. Painel:', this.organizePanelOpen);

    // ===================================================
    // ESCOLHA UMA DAS OPÇÕES ABAIXO PARA IMPLEMENTAR:
    // ===================================================

    // OPÇÃO 1: Abrir um modal de organização
    // this.openOrganizeModal();

    // OPÇÃO 2: Navegar para página de organização
    // this.router.navigate(['/organizar-ocorrencias']);

    // OPÇÃO 3: Mostrar painel lateral (sidebar)
    // Você pode criar um EventEmitter ou serviço para controlar o sidebar
    // this.organizeSidebarService.toggle();

    // OPÇÃO 4: Mostrar dropdown de opções
    // this.showOrganizeOptions();
  }

  /**
   * OPÇÃO 1: Abrir modal de organização
   * Descomente e implemente conforme seu serviço de modal
   */
  private openOrganizeModal(): void {
    // Exemplo com serviço de modal customizado:
    // this.modalService.open(OrganizeModalComponent, {
    //   size: 'lg',
    //   data: { occurrences: [] }
    // });

    // Exemplo com Angular Material Dialog:
    // this.dialog.open(OrganizeDialogComponent, {
    //   width: '600px',
    //   data: { /* dados */ }
    // });

    // Exemplo com NgBootstrap:
    // this.modalService.open(OrganizeModalComponent, {
    //   size: 'lg',
    //   backdrop: 'static'
    // });
  }

  /**
   * OPÇÃO 4: Mostrar opções de organização
   * Pode ser um dropdown customizado ou menu contextual
   */
  private showOrganizeOptions(): void {
    const options = [
      { label: 'Por Data Crescente', value: 'date-asc', icon: 'arrow_upward' },
      { label: 'Por Data Decrescente', value: 'date-desc', icon: 'arrow_downward' },
      { label: 'Por Banco', value: 'bank', icon: 'account_balance' },
      { label: 'Por Status', value: 'status', icon: 'flag' },
      { label: 'Por Valor', value: 'amount', icon: 'attach_money' },
      { label: 'Por Tipo', value: 'type', icon: 'category' }
    ];

    console.log('Opções de organização disponíveis:', options);

    // Implementar UI para mostrar essas opções
    // Pode ser um dropdown customizado, menu lateral, etc.
  }

  // ================================
  // LOGOUT
  // ================================
  logout(): void {
    console.log('Logout clicado');
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }

  // ================================
  // SWIPE GESTURES
  // ================================
  private setupSwipeGestures(): void {
    this.onTouchStartRef = (e: TouchEvent) => {
      if (!this.menuOpen || !this.isMobile) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    };

    this.onTouchEndRef = (e: TouchEvent) => {
      if (!this.menuOpen || !this.isMobile) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const dx = endX - this.touchStartX;
      const dy = endY - this.touchStartY;

      if (dx > 100 && Math.abs(dy) < 50) {
        this.closeMenu();
      }
    };

    document.addEventListener('touchstart', this.onTouchStartRef, { passive: true });
    document.addEventListener('touchend', this.onTouchEndRef, { passive: true });
  }

  // ================================
  // ACESSIBILIDADE (ESC)
  // ================================
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.menuOpen) this.closeMenu();
    else if (this.dropdownOpen) this.closeDropdown();
    else if (this.organizePanelOpen) this.organizePanelOpen = false;
  }

  // ================================
  // CLIQUES
  // ================================
  onMenuClick(event: Event): void {
    event.stopPropagation();
  }

  onBackdropClick(): void {
    this.closeMenu();
  }
}
