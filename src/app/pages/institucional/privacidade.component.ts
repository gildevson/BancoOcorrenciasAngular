import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacidade',
  standalone: true,
  imports: [RouterModule],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.4C17.5 21.15 21 16.25 21 11V5L12 2z" stroke="white" stroke-width="1.8" fill="rgba(255,255,255,0.15)"/>
            <circle cx="12" cy="12" r="2.5" fill="white"/>
            <line x1="12" y1="10" x2="12" y2="8" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <h1>Política de Privacidade</h1>
        <p class="hero-sub">Última atualização: 23 de junho de 2026</p>
      </div>
    </section>

    <!-- Conteúdo -->
    <section class="content">
      <div class="wrap">

        <!-- Banner info -->
        <div class="info-banner">
          <span class="info-ico">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#1565c0" stroke-width="2"/>
              <line x1="12" y1="11" x2="12" y2="17" stroke="#1565c0" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="7.5" r="1" fill="#1565c0"/>
            </svg>
          </span>
          <p>Esta política descreve como o portal <strong>Banco Ocorrências</strong> coleta, usa e protege suas informações.</p>
        </div>

        <!-- 1 -->
        <h2>1. Informações que Coletamos</h2>
        <p>O portal Banco Ocorrências pode coletar os seguintes tipos de informações:</p>
        <ul>
          <li><strong>Dados de navegação:</strong> páginas visitadas, tempo de permanência, tipo de dispositivo e navegador.</li>
          <li><strong>Dados de conta:</strong> quando você se cadastra, coletamos nome, e-mail e senha (criptografada).</li>
          <li><strong>Arquivos CNAB:</strong> arquivos enviados para validação são processados localmente no navegador e <strong>não são armazenados</strong> em nossos servidores.</li>
          <li><strong>Cookies:</strong> utilizamos cookies para manter sua sessão ativa e melhorar a experiência de uso.</li>
        </ul>

        <!-- 2 -->
        <h2>2. Como Usamos suas Informações</h2>
        <p>As informações coletadas são utilizadas para:</p>
        <ul>
          <li>Fornecer e melhorar os serviços do portal;</li>
          <li>Autenticar usuários registrados;</li>
          <li>Analisar o uso do portal para aprimorar funcionalidades;</li>
          <li>Exibir anúncios relevantes através do Google AdSense;</li>
          <li>Enviar comunicações relacionadas ao serviço (quando autorizado).</li>
        </ul>

        <!-- 3 -->
        <h2>3. Google AdSense e Publicidade</h2>
        <p>
          Este portal utiliza o <strong>Google AdSense</strong> para exibição de anúncios. O Google pode utilizar
          cookies para exibir anúncios baseados em visitas anteriores ao nosso site ou a outros sites na internet.
        </p>
        <p>
          Você pode desativar o uso de cookies pelo Google acessando as
          Configurações de anúncios do Google.
        </p>

        <!-- 4 -->
        <h2>4. Compartilhamento de Informações</h2>
        <p>
          Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros, exceto quando necessário
          para operar o portal ou quando exigido por lei. Podemos compartilhar dados anonimizados e agregados para
          fins analíticos.
        </p>

        <!-- 5 -->
        <h2>5. Segurança dos Dados</h2>
        <p>
          Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado,
          alteração, divulgação ou destruição. Senhas são armazenadas com criptografia e as comunicações são
          realizadas via HTTPS.
        </p>

        <!-- 6 -->
        <h2>6. Cookies</h2>
        <p>Utilizamos cookies para:</p>
        <ul>
          <li>Manter sessões de usuários autenticados;</li>
          <li>Lembrar preferências de uso;</li>
          <li>Analisar o tráfego do site (Google Analytics);</li>
          <li>Servir anúncios personalizados (Google AdSense).</li>
        </ul>
        <p>
          Você pode configurar seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades do portal.
        </p>

        <!-- 7 -->
        <h2>7. Seus Direitos (LGPD)</h2>
        <p>
          Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), você tem direito a:
        </p>
        <ul>
          <li>Acessar os dados pessoais que temos sobre você;</li>
          <li>Corrigir dados incompletos ou desatualizados;</li>
          <li>Solicitar a exclusão dos seus dados;</li>
          <li>Revogar o consentimento para uso dos dados;</li>
          <li>Solicitar a portabilidade dos seus dados.</li>
        </ul>
        <p>Para exercer esses direitos, entre em contato pelo e-mail: <a href="mailto:bancoocorrencias@gmail.com">contato&#64;bancosocorrencia.com</a></p>

        <!-- 8 -->
        <h2>8. Alterações nesta Política</h2>
        <p>
          Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas publicando a
          nova versão nesta página com a data de atualização. Recomendamos verificar esta página regularmente.
        </p>

        <!-- 9 -->
        <h2>9. Contato</h2>
        <p>Em caso de dúvidas sobre esta política de privacidade, entre em contato:</p>

        <div class="contact-cards">
          <div class="contact-card">
            <span class="cc-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#1565c0" stroke-width="2"/><path d="M2 7L12 13L22 7" stroke="#1565c0" stroke-width="2"/></svg>
            </span>
            <div>
              <div class="cc-label">email</div>
              <a href="mailto:bancoocorrencias@gmail.com" class="cc-val">contato&#64;bancosocorrencia.com</a>
            </div>
          </div>
          <div class="contact-card">
            <span class="cc-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#1565c0" stroke-width="2"/><path d="M2 12h20M12 2c-2.5 3-4 6-4 10s1.5 7 4 10M12 2c2.5 3 4 6 4 10s-1.5 7-4 10" stroke="#1565c0" stroke-width="1.5"/></svg>
            </span>
            <div>
              <div class="cc-label">language</div>
              <span class="cc-val">bancosocorrencia.com</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    /* Hero */
    .hero {
      background: linear-gradient(180deg, #072231 0%, #061b27 100%);
      color: #fff;
      text-align: center;
      padding: 52px 20px 60px;
    }
    .hero-inner { max-width: 680px; margin: 0 auto; }
    .hero-icon {
      width: 60px; height: 60px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 18px;
    }
    .hero h1 { font-size: 28px; font-weight: 800; margin: 0 0 10px; }
    .hero-sub { font-size: 13px; color: rgba(255,255,255,0.88); margin: 0; }

    /* Conteúdo */
    .content { background: #f5f8fb; min-height: 50vh; padding: 48px 20px 72px; }
    .wrap { max-width: 860px; margin: 0 auto; }

    /* Banner */
    .info-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #e8f0fe;
      border: 1px solid #c5d8f6;
      border-left: 4px solid #1565c0;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 36px;
    }
    .info-ico { flex-shrink: 0; margin-top: 2px; }
    .info-banner p { font-size: 14px; color: #333; line-height: 1.6; margin: 0; }

    /* Tipografia */
    h2 {
      font-size: 16px;
      font-weight: 800;
      color: #1565c0;
      margin: 32px 0 10px;
    }
    p { font-size: 14px; line-height: 1.75; color: #444; margin: 0 0 10px; }
    ul { margin: 0 0 12px 0; padding-left: 22px; }
    li { font-size: 14px; line-height: 1.75; color: #444; margin-bottom: 4px; }
    a { color: #1565c0; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Cards de contato */
    .contact-cards { display: flex; gap: 16px; margin-top: 18px; flex-wrap: wrap; }
    .contact-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff;
      border: 1px solid #e0eaf2;
      border-radius: 10px;
      padding: 14px 18px;
      min-width: 220px;
    }
    .cc-icon {
      width: 36px; height: 36px;
      background: #e8f0fe;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .cc-label { font-size: 11px; color: #888; text-transform: lowercase; margin-bottom: 2px; }
    .cc-val { font-size: 13px; color: #1565c0; font-weight: 600; }

    @media (max-width: 540px) {
      .hero h1 { font-size: 22px; }
      .contact-cards { flex-direction: column; }
    }
  `]
})
export class PrivacidadeComponent {}
