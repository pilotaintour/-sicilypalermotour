/**
 * STEP 3: Dati Personali del Referente
 */

class Step3Dati {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onComplete = options.onComplete || null;
        this.onPrev = options.onPrev || null;

        this.init();
    }

    init() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="step-card-header">
                👤 Step 3: Dati Personali del Referente
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
                <label for="step3-user-name" style="display: block; font-weight: 700; margin-bottom: 6px; color: #1e293b;">Nome e Cognome Completo *</label>
                <input type="text" id="step3-user-name" required placeholder="Es. Mario Rossi" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 100%; font-size: 1rem; box-sizing: border-box;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
                <div>
                    <label for="step3-user-email" style="display: block; font-weight: 700; margin-bottom: 6px; color: #1e293b;">Email *</label>
                    <input type="email" id="step3-user-email" required placeholder="mario@example.com" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                </div>
                <div>
                    <label for="step3-user-phone" style="display: block; font-weight: 700; margin-bottom: 6px; color: #1e293b;">Telefono / WhatsApp *</label>
                    <input type="tel" id="step3-user-phone" required placeholder="+39 340 1234567" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                </div>
            </div>

            <div class="form-group" style="margin-bottom: 20px;">
                <label for="step3-user-notes" style="display: block; font-weight: 700; margin-bottom: 6px; color: #1e293b;">Note o Richieste Particolari (Opzionale)</label>
                <textarea id="step3-user-notes" rows="3" placeholder="Es. Lingua parlata preferita, passeggini, allergie alimentari..." style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 100%; font-size: 0.95rem; box-sizing: border-box;"></textarea>
            </div>

            <div class="step-nav-bar">
                <button type="button" class="btn-nav-prev" id="btn-step3-prev">
                    ← Indietro
                </button>
                <button type="button" class="btn-nav-next" id="btn-step3-next">
                    Avanti: Riepilogo & Conferma →
                </button>
            </div>
        `;

        this.container.querySelector('#btn-step3-prev').onclick = () => {
            if (typeof this.onPrev === 'function') this.onPrev();
        };

        this.container.querySelector('#btn-step3-next').onclick = () => this.validaEProsegui();
    }

    validaEProsegui() {
        const name = this.container.querySelector('#step3-user-name').value.trim();
        const email = this.container.querySelector('#step3-user-email').value.trim();
        const phone = this.container.querySelector('#step3-user-phone').value.trim();
        const notes = this.container.querySelector('#step3-user-notes').value.trim();

        if (!name || !email || !phone) {
            alert('Per favore compila tutti i campi obbligatori del referente (Nome, Email e Telefono).');
            return;
        }

        if (typeof this.onComplete === 'function') {
            this.onComplete({
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                notes: notes
            });
        }
    }

    getData() {
        return {
            customerName: this.container.querySelector('#step3-user-name').value.trim(),
            customerEmail: this.container.querySelector('#step3-user-email').value.trim(),
            customerPhone: this.container.querySelector('#step3-user-phone').value.trim(),
            notes: this.container.querySelector('#step3-user-notes').value.trim()
        };
    }
}
