/**
 * STEP 4: Riepilogo Professionale & Pre-Autorizzazione Pagamento Carta / Stripe / PayPal
 * Sicily Palermo Tour - Layout Elegante con Trust Badges e Garanzie di Sicurezza
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
                📋 Step 4: Riepilogo Ordine & Pagamento Sicuro
            </div>

            <!-- Riquadro Garanzia & Cancellazione Gratuita -->
            <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 14px;">
                <div style="font-size: 2rem;">🔄</div>
                <div>
                    <strong style="color: #166534; font-size: 0.98rem; display: block;">Cancellazione Gratuita al 100%</strong>
                    <span style="font-size: 0.85rem; color: #15803d;">Puoi cancellare la prenotazione fino a 24 ore prima dell'inizio del tour senza alcuna penale o trattenuta.</span>
                </div>
            </div>

            <div id="step4-summary-box" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 22px; margin-bottom: 20px;">
                <!-- Popolato via JS -->
            </div>

            <!-- Contenitore Form Carta Stripe & PayPal Montato da stripe-payment.js -->
            <div id="stripe-card-slot"></div>

            <!-- Badge di Sicurezza Transazione (Trust Badges) -->
            <div style="margin-top: 18px; padding: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 10px; text-align: center;">
                <div style="font-size: 0.82rem; color: #475569; font-weight: 600;">
                    🔒 Connessione Crittografata SSL 256-bit
                </div>
                <div style="font-size: 0.82rem; color: #475569; font-weight: 600;">
                    🛡️ Sicurezza PCI-DSS Livello 1
                </div>
                <div style="font-size: 0.82rem; color: #0b2545; font-weight: bold;">
                    💳 Powered by Stripe & PayPal
                </div>
            </div>

            <div class="step-nav-bar" style="margin-top: 25px;">
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
                    btnConfirm.textContent = "⏳ Elaborazione in corso...";
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

        const langLabel = data.language ? ` 🌐 (${data.language})` : '';

        box.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1rem;">
                <span style="color: #64748b;">Codice Prenotazione:</span>
                <strong style="color: #0369a1; font-family: monospace; font-size: 1.1rem;">${data.code || '#SPT-BOOK'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1rem;">
                <span style="color: #64748b;">Tour Selezionato:</span>
                <strong style="color: #1b4f72;">${data.tourTitle || 'Tour Palermo'}${langLabel}</strong>
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
                <span style="color: #64748b;">Referente Principale:</span>
                <strong>${data.customerName} (${data.customerPhone})</strong>
            </div>
            ${data.billingAddress ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.92rem;">
                    <span style="color: #64748b;">Residenza / Fatturazione:</span>
                    <span style="color: #334155; font-weight: 600;">${data.billingAddress}</span>
                </div>
            ` : ''}

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

            <!-- Ripartizione Trasparente del Prezzo -->
            <div style="border-top: 2px dashed #cbd5e1; padding-top: 14px; margin-top: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.92rem; color: #64748b; margin-bottom: 6px;">
                    <span>Quota Partecipanti (${data.adults} Adulti${data.children > 0 ? `, ${data.children} Bambini` : ''}):</span>
                    <span>€${data.total}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.92rem; color: #166534; margin-bottom: 10px;">
                    <span>Tasse, Servizi & Assistenza:</span>
                    <span>Inclusi (0.00€)</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 800; color: #0b2545; border-top: 1px solid #cbd5e1; padding-top: 10px;">
                    <span>Totale in Pre-Autorizzazione:</span>
                    <span style="color: #0369a1;">€${data.total}</span>
                </div>
            </div>
        `;

        if (window.stripePayment) {
            window.stripePayment.mountCardForm('stripe-card-slot');
        }
    }
}
