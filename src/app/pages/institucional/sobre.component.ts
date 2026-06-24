import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [RouterModule],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1>Sobre o Banco Ocorrências</h1>
        <p class="hero-sub">
          Portal especializado em consulta, validação e gerenciamento de ocorrências
          bancárias e arquivos CNAB.
        </p>
      </div>
    </section>

    <!-- Conteúdo -->
    <section class="content">
      <div class="wrap">

        <!-- O que é -->
        <div class="section-block">
          <h2>
            <span class="info-ico">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#1565c0" stroke-width="2"/>
                <line x1="12" y1="11" x2="12" y2="17" stroke="#1565c0" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="7.5" r="1" fill="#1565c0"/>
              </svg>
            </span>
            O que é o Banco Ocorrências?
          </h2>
          <p>
            O <strong>Banco Ocorrências</strong> é um portal gratuito desenvolvido para
            profissionais do mercado financeiro, analistas de sistemas, desenvolvedores e
            empresas que trabalham com cobrança bancária no Brasil. Nossa missão é simplificar
            o entendimento e o processamento de arquivos CNAB (Centro Nacional de Automação
            Bancária), padrão definido pela FEBRABAN para troca de informações entre empresas
            e bancos.
          </p>
          <p>
            Através do portal, é possível consultar códigos de ocorrências de dezenas de bancos
            brasileiros, validar arquivos de remessa e retorno, utilizar calculadoras financeiras
            e acessar layouts oficiais dos principais bancos do país.
          </p>
        </div>

        <!-- Cards -->
        <div class="cards">
          <div class="card">
            <div class="card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#1565c0" stroke-width="2"/>
                <path d="M16.5 16.5L21 21" stroke="#1565c0" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>Consulta de Ocorrências</h3>
            <p>Pesquise e entenda os códigos de ocorrências retornados pelos bancos nos arquivos CNAB 240 e CNAB 400.</p>
          </div>
          <div class="card">
            <div class="card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.4C17.5 21.15 21 16.25 21 11V5L12 2z" stroke="#1565c0" stroke-width="2"/>
                <path d="M8.5 12l2.5 2.5 4.5-5" stroke="#1565c0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Validadores CNAB</h3>
            <p>Valide seus arquivos de remessa e retorno bancário antes de enviá-los ou processá-los em seu sistema.</p>
          </div>
          <div class="card">
            <div class="card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="#1565c0" stroke-width="2"/>
                <path d="M3 9h18M9 9v12M3 15h6M3 21h6" stroke="#1565c0" stroke-width="1.5"/>
                <path d="M13 13h5M13 17h5" stroke="#1565c0" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>Calculadoras Financeiras</h3>
            <p>Simule juros, mora, multa, IOF e deságio de títulos com nossas calculadoras especializadas.</p>
          </div>
          <div class="card">
            <div class="card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8L14 2z" stroke="#1565c0" stroke-width="2"/>
                <path d="M14 2v6h6M8 13h8M8 17h5" stroke="#1565c0" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>Layouts Bancários</h3>
            <p>Acesse os layouts oficiais dos principais bancos brasileiros em formato PDF para consulta técnica.</p>
          </div>
        </div>

        <!-- Para quem é -->
        <div class="section-block" style="margin-top:32px">
          <h2>
            <span class="info-ico">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#1565c0" stroke-width="2" stroke-linecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="#1565c0" stroke-width="2"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#1565c0" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
            Para quem é esse portal?
          </h2>
          <ul class="check-list">
            <li>
              <span class="chk">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#e8f5e9"/><path d="M7 12l3.5 3.5L17 9" stroke="#388e3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              Desenvolvedores que integram sistemas com bancos via CNAB
            </li>
            <li>
              <span class="chk">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#e8f5e9"/><path d="M7 12l3.5 3.5L17 9" stroke="#388e3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              Analistas financeiros que processam cobranças bancárias
            </li>
            <li>
              <span class="chk">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#e8f5e9"/><path d="M7 12l3.5 3.5L17 9" stroke="#388e3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              Empresas de factoring e securitizadoras
            </li>
            <li>
              <span class="chk">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#e8f5e9"/><path d="M7 12l3.5 3.5L17 9" stroke="#388e3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              Contadores e profissionais de backoffice financeiro
            </li>
            <li>
              <span class="chk">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#e8f5e9"/><path d="M7 12l3.5 3.5L17 9" stroke="#388e3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              Estudantes e profissionais aprendendo sobre o mercado bancário
            </li>
          </ul>
        </div>

        <!-- Diferenciais -->
        <div class="section-block" style="margin-top:32px">
          <h2>
            <span class="info-ico">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="#1565c0" stroke-width="2" stroke-linejoin="round"/>
              </svg>
            </span>
            Diferenciais do Portal
          </h2>
          <div class="dif-grid">
            <div class="dif-item">
              <span class="dif-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#1565c0" stroke-width="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="#1565c0" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
              <div>
                <strong>100% Gratuito</strong>
                <p>Todas as funcionalidades disponíveis sem custo para o usuário.</p>
              </div>
            </div>
            <div class="dif-item">
              <span class="dif-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#1565c0" stroke-width="2"/>
                  <path d="M12 7v5l3 3" stroke="#1565c0" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
              <div>
                <strong>Atualizado Constantemente</strong>
                <p>Layouts e ocorrências atualizados conforme os bancos publicam novas versões.</p>
              </div>
            </div>
            <div class="dif-item">
              <span class="dif-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="14" rx="2" stroke="#1565c0" stroke-width="2"/>
                  <path d="M8 20h8M12 18v2" stroke="#1565c0" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
              <div>
                <strong>Responsivo</strong>
                <p>Acesse de qualquer dispositivo: desktop, tablet ou smartphone.</p>
              </div>
            </div>
            <div class="dif-item">
              <span class="dif-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.4C17.5 21.15 21 16.25 21 11V5L12 2z" stroke="#1565c0" stroke-width="2"/>
                </svg>
              </span>
              <div>
                <strong>Seguro</strong>
                <p>Nenhum arquivo enviado ao portal é armazenado em nossos servidores.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="cta">
          <h3>Comece a usar agora</h3>
          <p>Explore todas as funcionalidades do portal gratuitamente.</p>
          <div class="cta-btns">
            <a routerLink="/ocorrencia" class="btn-outline">Consultar Ocorrências</a>
            <a routerLink="/validadores" class="btn-solid">Acessar Validadores</a>
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
      padding: 56px 20px 64px;
    }
    .hero-inner { max-width: 700px; margin: 0 auto; }
    .hero-icon {
      width: 68px; height: 68px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }
    .hero h1 { font-size: 30px; font-weight: 800; margin: 0 0 14px; }
    .hero-sub { font-size: 15px; color: rgba(255,255,255,0.88); line-height: 1.6; max-width: 540px; margin: 0 auto; }

    /* Conteúdo */
    .content { background: #f5f8fb; padding: 52px 20px 64px; }
    .wrap { max-width: 1100px; margin: 0 auto; }

    /* Bloco */
    .section-block {
      background: #fff;
      border: 1px solid #e0eaf2;
      border-radius: 14px;
      padding: 28px 32px;
      margin-bottom: 24px;
    }
    .section-block h2 {
      font-size: 17px;
      font-weight: 800;
      color: #00253F;
      margin: 0 0 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e8f0f7;
    }
    .info-ico { display: flex; align-items: center; }
    .section-block p { font-size: 14px; line-height: 1.75; color: #444; margin: 0 0 12px; }
    .section-block p:last-child { margin-bottom: 0; }

    /* Cards */
    .cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 0;
    }
    .card {
      background: #fff;
      border: 1px solid #e0eaf2;
      border-radius: 14px;
      padding: 28px 18px 22px;
      text-align: center;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .card:hover { box-shadow: 0 6px 24px rgba(0,37,63,0.10); transform: translateY(-2px); }
    .card-icon { margin-bottom: 14px; display: flex; justify-content: center; }
    .card h3 { font-size: 14px; font-weight: 700; color: #1565c0; margin: 0 0 8px; }
    .card p { font-size: 12px; color: #1565c0; line-height: 1.65; margin: 0; }

    /* Checklist */
    .check-list { list-style: none; margin: 0; padding: 0; }
    .check-list li {
      display: flex; align-items: center; gap: 10px;
      font-size: 14px; color: #333;
      padding: 6px 0;
      border-bottom: 1px solid #f0f4f8;
    }
    .check-list li:last-child { border-bottom: none; }
    .chk { display: flex; align-items: center; flex-shrink: 0; }

    /* Diferenciais */
    .dif-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .dif-item {
      display: flex; gap: 14px; align-items: flex-start;
    }
    .dif-ico {
      width: 44px; height: 44px;
      background: #e8f0fe;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .dif-item strong { font-size: 14px; font-weight: 700; color: #00253F; display: block; margin-bottom: 4px; }
    .dif-item p { font-size: 13px; color: #666; line-height: 1.6; margin: 0; }

    /* CTA */
    .cta {
      background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
      border-radius: 16px;
      padding: 40px 32px;
      text-align: center;
      margin-top: 32px;
      color: #fff;
    }
    .cta h3 { font-size: 22px; font-weight: 800; margin: 0 0 8px; }
    .cta p { font-size: 14px; opacity: 0.88; margin: 0 0 24px; }
    .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .btn-outline {
      padding: 11px 24px;
      border: 2px solid rgba(255,255,255,0.7);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-outline:hover { background: rgba(255,255,255,0.12); }
    .btn-solid {
      padding: 11px 24px;
      background: #fff;
      border-radius: 8px;
      color: #1565c0;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-solid:hover { background: #e8f0fe; }

    /* Responsivo */
    @media (max-width: 900px) {
      .cards { grid-template-columns: repeat(2, 1fr); }
      .dif-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 540px) {
      .cards { grid-template-columns: 1fr; }
      .section-block { padding: 20px 16px; }
      .hero h1 { font-size: 24px; }
      .cta { padding: 28px 20px; }
    }
  `]
})
export class SobreComponent {}
