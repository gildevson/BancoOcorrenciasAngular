import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly KEY = 'cookie_consent';

  hasConsented(): boolean | null {
    const val = localStorage.getItem(this.KEY);
    if (val === null) return null;
    return val === 'true';
  }

  accept(): void {
    localStorage.setItem(this.KEY, 'true');
    this.loadTrackingScripts();
  }

  reject(): void {
    localStorage.setItem(this.KEY, 'false');
  }

  private loadTrackingScripts(): void {
    this.loadMetaPixel();
    this.loadGTM();
  }

  private loadMetaPixel(): void {
    const pixelId = 'SEU_META_PIXEL_ID'; // substituir após criar no Meta
    if (pixelId === 'SEU_META_PIXEL_ID') return;

    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }

  private loadGTM(): void {
    const gtmId = 'SEU_GTM_ID'; // substituir após criar no GTM
    if (gtmId === 'SEU_GTM_ID') return;

    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(script);
  }
}
