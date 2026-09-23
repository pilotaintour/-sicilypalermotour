/**
 * STEP 2: Selezione Partecipanti
 */

class Step2Partecipanti {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onComplete = options.onComplete || null;
        this.onPrev = options.onPrev || null;

        this.numAdulti = 2;
        this.numBambini = 0;
        this.maxCap = 15;
        this.timeSlot = '09:30';

        this.init();
    }

    init() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="step-card-header">
                👥 Step 2: Seleziona Numero di Partecipanti
            </div>

            <div style="background: #f8fafc; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 0.9rem; color: #1b4f72; font-weight: 600;">
                ⏰ Orario Selezionato: <span id="step2-slot-display">09:30</span> | Capienza Massima: <span id="step2-cap-display">15</span> persone
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f1f5f9;">
                <div>
                    <strong style="color: #334155; display: block; font-size: 1.05rem;">Adulti</strong>
                    <span style="font-size: 0.85rem; color: #64748b;">Età 13+ anni</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button type="button" class="btn-nav-prev" style="padding: 6px 14px; min-width: 38px;" id="btn-adulti-minus">-</button>
                    <span id="step2-cnt-adulti" style="font-weight: 800; font-size: 1.2rem; width: 26px; text-align: center;">2</span>
                    <button type="button" class="btn-nav-prev" style="padding: 6px 14px; min-width: 38px;" id="btn-adulti-plus">+</button>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f1f5f9; margin-bottom: 20px;">
                <div>
                    <strong style="color: #334155; display: block; font-size: 1.05rem;">Bambini</strong>
                    <span style="font-size: 0.85rem; color: #64748b;">Età 4-12 anni (Sconto -50%)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button type="button" class="btn-nav-prev" style="padding: 6px 14px; min-width: 38px;" id="btn-bambini-minus">-</button>
                    <span id="step2-cnt-bambini" style="font-weight: 800; font-size: 1.2rem; width: 26px; text-align: center;">0</span>
                    <button type="button" class="btn-nav-prev" style="padding: 6px 14px; min-width: 38px;" id="btn-bambini-plus">+</button>
                </div>
            </div>

            <div class="step-nav-bar">
                <button type="button" class="btn-nav-prev" id="btn-step2-prev">
                    ← Indietro
                </button>
                <button type="button" class="btn-nav-next" id="btn-step2-next">
                    Avanti: I Tuoi Dati →
                </button>
            </div>
        `;

        this.container.querySelector('#btn-adulti-minus').onclick = () => this.modifica('adulti', -1);
        this.container.querySelector('#btn-adulti-plus').onclick = () => this.modifica('adulti', 1);
        this.container.querySelector('#btn-bambini-minus').onclick = () => this.modifica('bambini', -1);
        this.container.querySelector('#btn-bambini-plus').onclick = () => this.modifica('bambini', 1);

        this.container.querySelector('#btn-step2-prev').onclick = () => {
            if (typeof this.onPrev === 'function') this.onPrev();
        };

        this.container.querySelector('#btn-step2-next').onclick = () => this.validaEProsegui();
    }

    setSlotInfo(slotTime, maxCap) {
        this.timeSlot = slotTime || '09:30';
        this.maxCap = parseInt(maxCap, 10) || 15;

        const slotDisp = this.container.querySelector('#step2-slot-display');
        const capDisp = this.container.querySelector('#step2-cap-display');
        if (slotDisp) slotDisp.textContent = this.timeSlot;
        if (capDisp) capDisp.textContent = this.maxCap;
    }

    modifica(tipo, delta) {
        const totaleAttuale = this.numAdulti + this.numBambini;
        if (delta > 0 && (totaleAttuale + delta) > this.maxCap) {
            alert(`⚠️ Impossibile aggiungere altri partecipanti per l'orario delle ${this.timeSlot}. La capienza massima per questo slot è di ${this.maxCap} persone.`);
            return;
        }

        if (tipo === 'adulti') {
            this.numAdulti = Math.max(1, this.numAdulti + delta);
            const el = this.container.querySelector('#step2-cnt-adulti');
            if (el) el.textContent = this.numAdulti;
        } else if (tipo === 'bambini') {
            this.numBambini = Math.max(0, this.numBambini + delta);
            const el = this.container.querySelector('#step2-cnt-bambini');
            if (el) el.textContent = this.numBambini;
        }
    }

    validaEProsegui() {
        if (typeof this.onComplete === 'function') {
            this.onComplete({
                adults: this.numAdulti,
                children: this.numBambini
            });
        }
    }

    getData() {
        return {
            adults: this.numAdulti,
            children: this.numBambini
        };
    }
}
