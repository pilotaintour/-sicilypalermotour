/**
 * STEP 3: Dati Personali Completi e Data di Nascita per CIASCUN Partecipante (Obbligatori)
 * Design System Premium - Carte Passeggeri con Layout Elegante
 */

class Step3Dati {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onComplete = options.onComplete || null;
        this.onPrev = options.onPrev || null;

        this.adults = 2;
        this.children = 0;

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

    renderSelectDataNascita(idPrefix, isChild) {
        const currentYear = new Date().getFullYear();

        let yearsHtml = '<option value="">Anno *</option>';
        if (isChild) {
            for (let y = currentYear - 3; y >= currentYear - 12; y--) {
                yearsHtml += `<option value="${y}">${y}</option>`;
            }
        } else {
            for (let y = currentYear - 13; y >= 1920; y--) {
                yearsHtml += `<option value="${y}">${y}</option>`;
            }
        }

        let daysHtml = '<option value="">Giorno *</option>';
        for (let d = 1; d <= 31; d++) {
            const dStr = String(d).padStart(2, '0');
            daysHtml += `<option value="${dStr}">${d}</option>`;
        }

        const mesi = [
            'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
        ];
        let monthsHtml = '<option value="">Mese *</option>';
        mesi.forEach((m, idx) => {
            const mStr = String(idx + 1).padStart(2, '0');
            monthsHtml += `<option value="${mStr}">${m}</option>`;
        });

        return `
            <div style="display: grid; grid-template-columns: 1fr 1.3fr 1.1fr; gap: 10px;">
                <select id="${idPrefix}-day" required style="padding: 11px 10px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 0.92rem; background: #ffffff; color: #0f172a; box-sizing: border-box; font-weight: 500;">
                    ${daysHtml}
                </select>
                <select id="${idPrefix}-month" required style="padding: 11px 10px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 0.92rem; background: #ffffff; color: #0f172a; box-sizing: border-box; font-weight: 500;">
                    ${monthsHtml}
                </select>
                <select id="${idPrefix}-year" required style="padding: 11px 10px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 0.92rem; background: #ffffff; color: #0f172a; box-sizing: border-box; font-weight: 500;">
                    ${yearsHtml}
                </select>
            </div>
        `;
    }

    renderForm() {
        if (!this.container) return;

        const totalePartecipanti = this.adults + this.children;

        let html = `
            <div class="step-card-header">
                📛 Step 3: Dati Personali dei Passeggeri (${totalePartecipanti} Persone)
            </div>

            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 14px 18px; border-radius: 14px; border: 1px solid #bae6fd; margin-bottom: 24px; font-size: 0.9rem; color: #0369a1; font-weight: 600; box-shadow: 0 2px 8px rgba(3, 105, 161, 0.05);">
                📋 Registro Passeggeri Ufficiale: Inserisci Nome, Cognome, Data di Nascita e Provenienza per ciascuno dei <strong>${totalePartecipanti} partecipanti</strong> (${this.adults} Adulti${this.children > 0 ? `, ${this.children} Bambini` : ''}).
            </div>

            <!-- PARTECIPANTE 1: REFERENTE PRINCIPALE (PREMIUM GOLD & NAVY CARD) -->
            <div style="background: #ffffff; border: 2px solid #0b2545; border-radius: 16px; padding: 22px; margin-bottom: 22px; box-shadow: 0 8px 20px rgba(11, 37, 69, 0.08); position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <span style="background: linear-gradient(135deg, #0b2545, #134074); color: #ffffff; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.3px;">
                        ⭐ PASSEGGERO 1 - REFERENTE PRINCIPALE
                    </span>
                    <span style="font-size: 0.8rem; color: #d97706; font-weight: 700; background: #fef3c7; padding: 3px 10px; border-radius: 12px;">Capogruppo Tour</span>
                </div>

                <div class="form-group" style="margin-bottom: 14px;">
                    <label for="step3-name-1" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.92rem; color: #0f172a;">📛 Nome e Cognome Completo *</label>
                    <input type="text" id="step3-name-1" required placeholder="Es. Mario Rossi" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                    <div>
                        <label style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.92rem; color: #0f172a;">🎂 Data di Nascita *</label>
                        ${this.renderSelectDataNascita('step3-dob-1', false)}
                    </div>
                    <div>
                        <label for="step3-origin-1" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.92rem; color: #0f172a;">📍 Città / Provenienza *</label>
                        <input type="text" id="step3-origin-1" required placeholder="Es. Milano / Germania" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                    <div>
                        <label for="step3-lead-email" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.92rem; color: #0f172a;">📧 Email di Conferma *</label>
                        <input type="email" id="step3-lead-email" required placeholder="mario@example.com" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                    </div>
                    <div>
                        <label for="step3-lead-phone" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.92rem; color: #0f172a;">📞 Telefono / WhatsApp *</label>
                        <input type="tel" id="step3-lead-phone" required placeholder="+39 340 1234567" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                    </div>
                </div>

                <div>
                    <label for="step3-notes-1" style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.88rem; color: #475569;">📝 Note / Esigenze Particolari Referente 1 (Opzionale)</label>
                    <input type="text" id="step3-notes-1" placeholder="Es. Lingua parlata preferita, allergie alimentari, esigenze particolari..." style="padding: 11px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 0.92rem; box-sizing: border-box;">
                </div>
            </div>
        `;

        // PARTECIPANTI AGGIUNTIVI (DA 2 A N)
        let partCounter = 2;

        // Altri Adulti (da 2 a adults)
        for (let a = 2; a <= this.adults; a++) {
            html += `
                <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 20px; margin-bottom: 18px; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.03);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                        <span style="background: #f1f5f9; color: #334155; padding: 4px 12px; border-radius: 16px; font-size: 0.83rem; font-weight: 800;">
                            🧑 PASSEGGERO ${partCounter} - ADULTO
                        </span>
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label for="step3-name-${partCounter}" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #334155;">📛 Nome e Cognome Completo *</label>
                        <input type="text" id="step3-name-${partCounter}" required placeholder="Nome e Cognome Partecipante ${partCounter}" style="padding: 11px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 0.95rem; box-sizing: border-box;">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #334155;">🎂 Data di Nascita *</label>
                            ${this.renderSelectDataNascita(`step3-dob-${partCounter}`, false)}
                        </div>
                        <div>
                            <label for="step3-origin-${partCounter}" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #334155;">📍 Città / Provenienza *</label>
                            <input type="text" id="step3-origin-${partCounter}" required placeholder="Es. Roma / Francia" style="padding: 11px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 0.95rem; box-sizing: border-box;">
                        </div>
                    </div>

                    <div>
                        <label for="step3-notes-${partCounter}" style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.88rem; color: #64748b;">📝 Note / Esigenze Particolari Partecipante ${partCounter} (Opzionale)</label>
                        <input type="text" id="step3-notes-${partCounter}" placeholder="Es. Allergie, preferenze, esigenze particolari..." style="padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 0.92rem; box-sizing: border-box;">
                    </div>
                </div>
            `;
            partCounter++;
        }

        // Bambini (da 1 a children)
        for (let c = 1; c <= this.children; c++) {
            html += `
                <div style="background: #fffbf5; border: 1.5px solid #fed7aa; border-radius: 16px; padding: 20px; margin-bottom: 18px; box-shadow: 0 6px 16px rgba(217, 119, 6, 0.04);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #ffedd5; padding-bottom: 8px;">
                        <span style="background: #ffedd5; color: #c2410c; padding: 4px 12px; border-radius: 16px; font-size: 0.83rem; font-weight: 800;">
                            🧒 PASSEGGERO ${partCounter} - BAMBINO (4-12 Anni)
                        </span>
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label for="step3-name-${partCounter}" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #9a3412;">📛 Nome e Cognome Completo *</label>
                        <input type="text" id="step3-name-${partCounter}" required placeholder="Nome e Cognome Bambino ${partCounter}" style="padding: 11px; border: 1.5px solid #fed7aa; border-radius: 10px; width: 100%; font-size: 0.95rem; box-sizing: border-box;">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #9a3412;">🎂 Data di Nascita *</label>
                            ${this.renderSelectDataNascita(`step3-dob-${partCounter}`, true)}
                        </div>
                        <div>
                            <label for="step3-origin-${partCounter}" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #9a3412;">📍 Città / Provenienza *</label>
                            <input type="text" id="step3-origin-${partCounter}" required placeholder="Es. Torino / Spagna" style="padding: 11px; border: 1.5px solid #fed7aa; border-radius: 10px; width: 100%; font-size: 0.95rem; box-sizing: border-box;">
                        </div>
                    </div>

                    <div>
                        <label for="step3-notes-${partCounter}" style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.88rem; color: #c2410c;">📝 Note / Esigenze Particolari Bambino ${partCounter} (Opzionale)</label>
                        <input type="text" id="step3-notes-${partCounter}" placeholder="Es. Passeggino, intolleranze alimentari..." style="padding: 10px; border: 1.5px solid #fed7aa; border-radius: 10px; width: 100%; font-size: 0.92rem; box-sizing: border-box;">
                    </div>
                </div>
            `;
            partCounter++;
        }

        html += `
            <div class="step-nav-bar" style="margin-top: 28px;">
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
        const leadEmail = this.container.querySelector('#step3-lead-email').value.trim();
        const leadPhone = this.container.querySelector('#step3-lead-phone').value.trim();

        if (!leadEmail || !leadPhone) {
            alert('Per favore compila l\'Email ed il Telefono del Referente Principale.');
            return;
        }

        const totalePartecipanti = this.adults + this.children;
        const listaPartecipanti = [];

        // Valida Nome, Data di Nascita (Giorno, Mese, Anno), Provenienza e Note per ciascun partecipante da 1 a N
        for (let i = 1; i <= totalePartecipanti; i++) {
            const nameEl = this.container.querySelector(`#step3-name-${i}`);
            const dayEl = this.container.querySelector(`#step3-dob-${i}-day`);
            const monthEl = this.container.querySelector(`#step3-dob-${i}-month`);
            const yearEl = this.container.querySelector(`#step3-dob-${i}-year`);
            const originEl = this.container.querySelector(`#step3-origin-${i}`);
            const notesEl = this.container.querySelector(`#step3-notes-${i}`);

            const nameVal = nameEl ? nameEl.value.trim() : '';
            const dayVal = dayEl ? dayEl.value : '';
            const monthVal = monthEl ? monthEl.value : '';
            const yearVal = yearEl ? yearEl.value : '';
            const originVal = originEl ? originEl.value.trim() : '';
            const notesVal = notesEl ? notesEl.value.trim() : '';

            if (!nameVal) {
                alert(`⚠️ Attenzione: è obbligatorio inserire il Nome e Cognome per il Partecipante ${i}.`);
                if (nameEl) nameEl.focus();
                return;
            }

            if (!dayVal || !monthVal || !yearVal) {
                alert(`⚠️ Attenzione: seleziona Giorno, Mese ed Anno di nascita per il Partecipante ${i} (${nameVal}).`);
                if (!dayVal && dayEl) dayEl.focus();
                else if (!monthVal && monthEl) monthEl.focus();
                else if (!yearVal && yearEl) yearEl.focus();
                return;
            }

            if (!originVal) {
                alert(`⚠️ Attenzione: è obbligatorio inserire il Luogo di Provenienza per il Partecipante ${i} (${nameVal}).`);
                if (originEl) originEl.focus();
                return;
            }

            const isLead = (i === 1);
            const isChild = i > this.adults;
            let typeLabel = isLead ? 'Referente Principale' : (isChild ? 'Bambino' : 'Adulto');

            const dobFormatted = `${dayVal}/${monthVal}/${yearVal}`;

            listaPartecipanti.push({
                number: i,
                name: nameVal,
                dob: dobFormatted,
                origin: originVal,
                notes: notesVal,
                type: typeLabel
            });
        }

        const leadName = listaPartecipanti[0].name;

        if (typeof this.onComplete === 'function') {
            this.onComplete({
                customerName: leadName,
                customerEmail: leadEmail,
                customerPhone: leadPhone,
                notes: listaPartecipanti[0].notes || '',
                participantsList: listaPartecipanti
            });
        }
    }
}
