/**
 * STEP 4: Riepilogo & Conferma Finale
 */

class Step4Conferma {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onConfirm = options.onConfirm || null;
        this.onPrev = options.onPrev || null;

        this.init();
    }

    init() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="step-card-header">
                📋 Step 4: Riepilogo & Conferma Finale
            </div>

            <div id="step4-summary-box" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 22px; margin-bottom: 20px;">
                <!-- Popolato via JS -->
            </div>

            <div style="background: #f0fdf4; border-radius: 10px; padding: 14px; border: 1px solid #bbf7d0; text-align: center; font-size: 0.85rem; color: #15803d; line-height: 1.5; margin-bottom: 20px;">
                🔒 <strong>Nessun Pagamento Anticipato Richiesto</strong><br>
                Pagamento direttamente sul posto prima della partenza del tour. Cancellazione gratuita fino a 24h prima.
            </div>

            <div class="step-nav-bar">
                <button type="button" class="btn-nav-prev" id="btn-step4-prev">
                    ← Indietro
                </button>
                <button type="button" class="btn-nav-confirm" id="btn-step4-confirm">
                    ✅ Conferma e Invia Prenotazione
                </button>
            </div>
        `;

        this.container.querySelector('#btn-step4-prev').onclick = () => {
            if (typeof this.onPrev === 'function') this.onPrev();
        };

        this.container.querySelector('#btn-step4-confirm').onclick = () => {
            if (typeof this.onConfirm === 'function') this.onConfirm();
        };
    }

    renderSummary(data) {
        const box = this.container.querySelector('#step4-summary-box');
        if (!box) return;

        box.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1rem;">
                <span style="color: #64748b;">Codice Prenotazione:</span>
                <strong style="color: #0369a1; font-family: monospace; font-size: 1.1rem;">${data.code || '#SPT-BOOK'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1rem;">
                <span style="color: #64748b;">Tour Selezionato:</span>
                <strong style="color: #1b4f72;">${data.tourTitle || 'Tour Palermo'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1rem;">
                <span style="color: #64748b;">Data della Visita:</span>
                <strong style="color: #1b4f72;">${data.dateReadable || 'Data non impostata'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1rem;">
                <span style="color: #64748b;">Orario di Partenza:</span>
                <strong>${data.slotTime || '09:30'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1rem;">
                <span style="color: #64748b;">Partecipanti:</span>
                <strong>${data.adults} Adulti${data.children > 0 ? `, ${data.children} Bambini` : ''}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1rem;">
                <span style="color: #64748b;">Referente:</span>
                <strong>${data.customerName} (${data.customerPhone})</strong>
            </div>
            ${data.participantsList && data.participantsList.length > 0 ? `
                <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid #e2e8f0;">
                    <strong style="color: #1b4f72; display: block; margin-bottom: 8px;">👥 Elenco Dettagliato Partecipanti (${data.participantsList.length}):</strong>
                    <ol style="margin: 0; padding-left: 20px; font-size: 0.92rem; color: #334155; line-height: 1.7;">
                        ${data.participantsList.map(p => `
                            <li>
                                <strong>${p.name}</strong>
                                <span style="color:#64748b;">(${p.age ? p.age + ' anni' : p.type}${p.origin ? ' - da ' + p.origin : ''})</span>
                            </li>
                        `).join('')}
                    </ol>
                </div>
            ` : ''}
            ${data.notes ? `
                <div style="margin-top: 12px; font-size: 0.95rem; color: #475569;">
                    <span>Note:</span> <em>"${data.notes}"</em>
                </div>
            ` : ''}
            <div style="border-top: 2px dashed #cbd5e1; padding-top: 14px; margin-top: 14px; display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 800; color: #1b4f72;">
                <span>Totale Stimato:</span>
                <span>€${data.total}</span>
            </div>
        `;
    }
}
