/**
 * STEP 4: Riepilogo & Pre-Autorizzazione Pagamento Carta di Credito / Stripe
 */

class Step4Conferma {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onConfirm = options.onConfirm || null;
        this.onPrev = options.onPrev || null;
        this.lastData = null;

        this.init();
    }

    init() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="step-card-header">
                📋 Step 4: Riepilogo & Pre-Autorizzazione Pagamento
            </div>

            <div id="step4-summary-box" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 22px; margin-bottom: 20px;">
                <!-- Popolato via JS -->
            </div>

            <!-- Contenitore Form Carta Stripe Montato dal modulo autonomo stripe-payment.js -->
            <div id="stripe-card-slot"></div>

            <div class="step-nav-bar">
                <button type="button" class="btn-nav-prev" id="btn-step4-prev">
                    ← Indietro
                </button>
                <button type="button" class="btn-nav-confirm" id="btn-step4-confirm">
                    💳 Pre-Autorizza & Invia Prenotazione
                </button>
            </div>
        `;

        this.container.querySelector('#btn-step4-prev').onclick = () => {
            if (typeof this.onPrev === 'function') this.onPrev();
        };

        this.container.querySelector('#btn-step4-confirm').onclick = async () => {
            if (window.stripePayment) {
                const btnConfirm = this.container.querySelector('#btn-step4-confirm');
                if (btnConfirm) {
                    btnConfirm.disabled = true;
                    btnConfirm.textContent = "⏳ Elaborazione Carta...";
                }

                const res = await window.stripePayment.processaPreAutorizzazione(
                    this.lastData ? this.lastData.total : '25.00',
                    this.lastData ? this.lastData.customerName : 'Cliente',
                    this.lastData ? this.lastData.customerEmail : ''
                );

                if (btnConfirm) {
                    btnConfirm.disabled = false;
                    btnConfirm.textContent = "💳 Pre-Autorizza & Invia Prenotazione";
                }

                if (res.success) {
                    if (typeof this.onConfirm === 'function') {
                        this.onConfirm(res);
                    }
                }
            } else {
                if (typeof this.onConfirm === 'function') this.onConfirm();
            }
        };
    }

    renderSummary(data) {
        this.lastData = data;
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
                    <strong style="color: #1b4f72; display: block; margin-bottom: 8px;">🧳 Elenco Dettagliato Partecipanti (${data.participantsList.length}):</strong>
                    <ol style="margin: 0; padding-left: 20px; font-size: 0.92rem; color: #334155; line-height: 1.7;">
                        ${data.participantsList.map(p => `
                            <li style="margin-bottom: 6px;">
                                <strong>${p.name}</strong>
                                <span style="color:#64748b;">(${p.dob ? 'Nato/a il ' + p.dob : p.type}${p.origin ? ' - da ' + p.origin : ''})</span>
                                ${p.notes ? `<div style="font-size:0.83rem; color:#475569; margin-top:2px;">📝 <em>Note: ${p.notes}</em></div>` : ''}
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
                <span>Totale in Pre-Autorizzazione:</span>
                <span>€${data.total}</span>
            </div>
        `;

        if (window.stripePayment) {
            window.stripePayment.mountCardForm('stripe-card-slot');
        }
    }
}
