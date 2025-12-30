import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

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

  activeSubNav = 'processamento';

  private routerSubscription?: Subscription;
  private touchStartX = 0;
  private touchStartY = 0;
  private lockedScrollY = 0;
  private onTouchStartRef?: (e: TouchEvent) => void;
  private onTouchEndRef?: (e: TouchEvent) => void;
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkMobile();
    this.setupRouterListener();
    this.setupSwipeGestures();
    this.onScroll(); // aplica scrolled no carregamento
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
    const top = document.body.style.top; // "-123px"

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
  // SWIPE
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
