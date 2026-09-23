/**
 * STEP 3: Dati Personali di TUTTI i Partecipanti (Obbligatori)
 */

class Step3Dati {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onComplete = options.onComplete || null;
        this.onPrev = options.onPrev || null;

        this.adults = 2;
        this.children = 0;
        this.participantsData = [];

        this.init();
    }

    init() {
        if (!this.container) return;
        this.renderForm();
    }

    setPartecipanti(adults, children) {
        this.adults = parseInt(adults, 10) || 1;
        this.children = parseInt(children, 10) || 0;
        this.renderForm();
    }

    renderForm() {
        if (!this.container) return;

        const totalePartecipanti = this.adults + this.children;

        let html = `
            <div class="step-card-header">
                👤 Step 3: Dati Personali dei Partecipanti (${totalePartecipanti} Persone Obbligatorie)
            </div>

            <div style="background: #e0f2fe; padding: 12px 16px; border-radius: 10px; border: 1px solid #bae6fd; margin-bottom: 20px; font-size: 0.88rem; color: #0369a1; font-weight: 600;">
                📋 Per motivi organizzativi e assicurativi, è obbligatorio inserire il Nome e Cognome di TUTTI i ${totalePartecipanti} partecipanti (${this.adults} Adulti${this.children > 0 ? `, ${this.children} Bambini` : ''}).
            </div>

            <!-- PARTECIPANTE 1: REFERENTE PRINCIPALE -->
            <div style="background: #ffffff; border: 2px solid #1b4f72; border-radius: 12px; padding: 18px; margin-bottom: 18px; box-shadow: 0 4px 12px rgba(27,79,114,0.08);">
                <div style="font-weight: 800; color: #1b4f72; font-size: 1.05rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    ⭐ Partecipante 1 - Referente Principale (Adulto)
                </div>

                <div class="form-group" style="margin-bottom: 12px;">
                    <label for="step3-lead-name" style="display: block; font-weight: 700; margin-bottom: 6px; color: #1e293b;">Nome e Cognome Completo *</label>
                    <input type="text" id="step3-lead-name" class="part-input-field" required placeholder="Es. Mario Rossi" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <label for="step3-lead-email" style="display: block; font-weight: 700; margin-bottom: 6px; color: #1e293b;">Email di Conferma *</label>
                        <input type="email" id="step3-lead-email" required placeholder="mario@example.com" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                    </div>
                    <div>
                        <label for="step3-lead-phone" style="display: block; font-weight: 700; margin-bottom: 6px; color: #1e293b;">Telefono / WhatsApp *</label>
                        <input type="tel" id="step3-lead-phone" required placeholder="+39 340 1234567" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                    </div>
                </div>
            </div>
        `;

        // PARTECIPANTI AGGIUNTIVI (DA 2 A N)
        let partCounter = 2;

        // Altri Adulti (da 2 a adults)
        for (let a = 2; a <= this.adults; a++) {
            html += `
                <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 14px;">
                    <div style="font-weight: 700; color: #334155; font-size: 0.98rem; margin-bottom: 8px;">
                        👤 Partecipante ${partCounter} - Adulto *
                    </div>
                    <input type="text" id="step3-part-${partCounter}" class="part-input-field" required placeholder="Nome e Cognome Partecipante ${partCounter}" style="padding: 11px; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 100%; font-size: 0.98rem; box-sizing: border-box;">
                </div>
            `;
            partCounter++;
        }

        // Bambini (da 1 a children)
        for (let c = 1; c <= this.children; c++) {
            html += `
                <div style="background: #fff7ed; border: 1.5px solid #ffedd5; border-radius: 12px; padding: 16px; margin-bottom: 14px;">
                    <div style="font-weight: 700; color: #c2410c; font-size: 0.98rem; margin-bottom: 8px;">
                        🧒 Partecipante ${partCounter} - Bambino (4-12 anni) *
                    </div>
                    <input type="text" id="step3-part-${partCounter}" class="part-input-field" required placeholder="Nome e Cognome Bambino ${partCounter}" style="padding: 11px; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 100%; font-size: 0.98rem; box-sizing: border-box;">
                </div>
            `;
            partCounter++;
        }

        html += `
            <div class="form-group" style="margin-top: 18px; margin-bottom: 22px;">
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

        this.container.innerHTML = html;

        this.container.querySelector('#btn-step3-prev').onclick = () => {
            if (typeof this.onPrev === 'function') this.onPrev();
        };

        this.container.querySelector('#btn-step3-next').onclick = () => this.validaEProsegui();
    }

    validaEProsegui() {
        const leadName = this.container.querySelector('#step3-lead-name').value.trim();
        const leadEmail = this.container.querySelector('#step3-lead-email').value.trim();
        const leadPhone = this.container.querySelector('#step3-lead-phone').value.trim();
        const notes = this.container.querySelector('#step3-user-notes').value.trim();

        if (!leadName || !leadEmail || !leadPhone) {
            alert('Per favore compila tutti i campi obbligatori del Referente Principale (Nome, Email e Telefono).');
            return;
        }

        const totalePartecipanti = this.adults + this.children;
        const listaPartecipanti = [
            { number: 1, name: leadName, type: 'Referente Principale' }
        ];

        // Valida ciascun partecipante aggiuntivo da 2 a N
        for (let i = 2; i <= totalePartecipanti; i++) {
            const inputEl = this.container.querySelector(`#step3-part-${i}`);
            if (inputEl) {
                const nameVal = inputEl.value.trim();
                if (!nameVal) {
                    alert(`⚠️ Attenzione: è obbligatorio inserire il Nome e Cognome per il Partecipante ${i}.`);
                    inputEl.focus();
                    return;
                }
                const isChild = i > this.adults;
                listaPartecipanti.push({
                    number: i,
                    name: nameVal,
                    type: isChild ? 'Bambino' : 'Adulto'
                });
            }
        }

        if (typeof this.onComplete === 'function') {
            this.onComplete({
                customerName: leadName,
                customerEmail: leadEmail,
                customerPhone: leadPhone,
                notes: notes,
                participantsList: listaPartecipanti
            });
        }
    }
}
