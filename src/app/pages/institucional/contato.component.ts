import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [RouterModule, FormsModule],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-icon">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" stroke-width="1.8"/>
            <path d="M2 7L12 13L22 7" stroke="white" stroke-width="1.8"/>
            <circle cx="8" cy="8" r="3" fill="white" opacity="0.3"/>
          </svg>
        </div>
        <h1>Entre em Contato</h1>
        <p class="hero-sub">Tem dúvidas, sugestões ou encontrou algum erro? Fale conosco!</p>
      </div>
    </section>

    <!-- Conteúdo -->
    <section class="content">
      <div class="wrap">
        <div class="grid">

          <!-- Coluna Esquerda -->
          <div class="col-info">
            <h2>Informações de Contato</h2>

            <div class="info-item">
              <span class="info-icon email-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#1565c0" stroke-width="2"/><path d="M2 7L12 13L22 7" stroke="#1565c0" stroke-width="2"/></svg>
              </span>
              <div>
                <div class="info-title">E-mail</div>
                <div class="info-val"><a href="mailto:bancoocorrencias@gmail.com">bancoocorrencias@gmail.com</a></div>
              </div>
            </div>

            <div class="info-item">
              <span class="info-icon site-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#1565c0" stroke-width="2"/><path d="M2 12h20M12 2c-2.5 3-4 6-4 10s1.5 7 4 10M12 2c2.5 3 4 6 4 10s-1.5 7-4 10" stroke="#1565c0" stroke-width="1.5"/></svg>
              </span>
              <div>
                <div class="info-title">Site</div>
                <div class="info-val">bancosocorrencia.com</div>
              </div>
            </div>

            <div class="info-item">
              <span class="info-icon clock-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#1565c0" stroke-width="2"/><path d="M12 7v5l3 3" stroke="#1565c0" stroke-width="2" stroke-linecap="round"/></svg>
              </span>
              <div>
                <div class="info-title">Tempo de Resposta</div>
                <div class="info-val">Respondemos em até 2 dias úteis</div>
              </div>
            </div>

            <div class="ajuda">
              <p class="ajuda-title">Podemos ajudar com:</p>
              <ul>
                <li><span class="check">✓</span> Dúvidas sobre CNAB 240 e CNAB 400</li>
                <li><span class="check">✓</span> Erros nos validadores de arquivo</li>
                <li><span class="check">✓</span> Sugestão de novos bancos ou layouts</li>
                <li><span class="check">✓</span> Códigos de ocorrências não encontrados</li>
                <li><span class="check">✓</span> Problemas de acesso ou cadastro</li>
                <li><span class="check">✓</span> Parcerias e colaborações</li>
              </ul>
            </div>
          </div>

          <!-- Coluna Direita — Formulário -->
          <div class="col-form">
            <h2>Enviar Mensagem</h2>

            @if (enviado) {
              <div class="sucesso">
                ✅ Mensagem enviada com sucesso! Responderemos em breve.
              </div>
            }

            @if (!enviado) {
            <form (ngSubmit)="enviar()" #f="ngForm">
              <div class="field">
                <label>Nome completo <span class="req">*</span></label>
                <input type="text" name="nome" [(ngModel)]="form.nome" placeholder="Seu nome" required />
              </div>
              <div class="field">
                <label>E-mail <span class="req">*</span></label>
                <input type="email" name="email" [(ngModel)]="form.email" placeholder="seu@email.com" required />
              </div>
              <div class="field">
                <label>Mensagem <span class="req">*</span></label>
                <textarea name="mensagem" [(ngModel)]="form.mensagem" placeholder="Descreva sua dúvida ou sugestão..." rows="6" required></textarea>
              </div>
              <button type="submit" [disabled]="f.invalid" class="btn-enviar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>
                Enviar Mensagem
              </button>
            </form>
            }
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
    .hero-inner { max-width: 680px; margin: 0 auto; }
    .hero-icon {
      width: 64px; height: 64px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }
    .hero h1 { font-size: 30px; font-weight: 800; margin: 0 0 14px; }
    .hero-sub { font-size: 15px; opacity: 0.85; line-height: 1.6; margin: 0; }

    /* Conteúdo */
    .content { background: #f5f8fb; min-height: 50vh; padding: 52px 20px 64px; }
    .wrap { max-width: 1100px; margin: 0 auto; }

    /* Grid */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: 32px;
    }

    /* Coluna Info */
    .col-info h2, .col-form h2 {
      font-size: 18px;
      font-weight: 800;
      color: #1565c0;
      margin: 0 0 24px;
    }

    .info-item {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .info-icon {
      width: 38px; height: 38px;
      background: #e8f0fe;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .info-title { font-size: 14px; font-weight: 700; color: #1565c0; margin-bottom: 2px; }
    .info-val { font-size: 13px; color: #555; }
    .info-val a { color: #555; text-decoration: none; }
    .info-val a:hover { color: #1565c0; text-decoration: underline; }

    /* Ajuda */
    .ajuda {
      margin-top: 28px;
      background: #fff;
      border: 1px solid #e0eaf2;
      border-radius: 12px;
      padding: 20px 22px;
    }
    .ajuda-title { font-size: 14px; font-weight: 700; color: #333; margin: 0 0 14px; }
    .ajuda ul { list-style: none; margin: 0; padding: 0; }
    .ajuda li { font-size: 13px; color: #555; padding: 4px 0; display: flex; gap: 8px; align-items: center; }
    .check { color: #388e3c; font-size: 14px; font-weight: 700; flex-shrink: 0; }

    /* Formulário */
    .col-form {
      background: #fff;
      border: 1px solid #e0eaf2;
      border-radius: 14px;
      padding: 32px 30px;
    }
    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; }
    .req { color: #e53935; }
    .field input, .field textarea {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #d0dce8;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 14px;
      color: #333;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    .field input:focus, .field textarea:focus { border-color: #1565c0; }
    .field textarea { resize: vertical; min-height: 120px; }

    .btn-enviar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #607d8b;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 4px;
    }
    .btn-enviar:hover:not(:disabled) { background: #1565c0; }
    .btn-enviar:disabled { opacity: 0.65; cursor: not-allowed; }

    .sucesso {
      background: #e8f5e9;
      border: 1px solid #a5d6a7;
      border-radius: 10px;
      padding: 18px 20px;
      color: #2e7d32;
      font-size: 14px;
      font-weight: 600;
    }

    /* Responsivo */
    @media (max-width: 860px) {
      .grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 540px) {
      .hero h1 { font-size: 22px; }
      .col-form { padding: 22px 18px; }
    }
  `]
})
export class ContatoComponent {
  form = { nome: '', email: '', mensagem: '' };
  enviado = false;

  enviar() {
    this.enviado = true;
    this.form = { nome: '', email: '', mensagem: '' };
  }
}
