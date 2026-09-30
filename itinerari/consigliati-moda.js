/**
 * MODULO AUTONOMO SEPARATO: Gestione Sezioni "Consigliati per Te" & "Più alla Moda / Trending"
 * Sicily Palermo Tour - Render Visivo Dinamico & Sincronizzazione con Admin
 */

class ConsigliatiModaManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.renderSezioni();
        });
    }

    // Carica gli itinerari dal localStorage / Cloud
    getItinerari() {
        if (typeof window.getItinerari === 'function') {
            return window.getItinerari();
        }
        try {
            const saved = localStorage.getItem('spt_itineraries') || '[]';
            return JSON.parse(saved);
        } catch (e) {
            console.error("Errore lettura itinerari in ConsigliatiModaManager:", e);
            return [];
        }
    }

    renderSezioni() {
        const list = this.getItinerari();
        if (!list || list.length === 0) return;

        // 1. Filtro "Consigliati per Te"
        let consigliatiList = list.filter(item => item.isConsigliato === true || item.isConsigliato === 'true');
        if (consigliatiList.length === 0) {
            // Fallback automatico: primo tour e tour in evidenza
            consigliatiList = list.filter(i => i.featured === 'true' || i.featured === true).slice(0, 3);
            if (consigliatiList.length === 0) consigliatiList = list.slice(0, 3);
        }

        // 2. Filtro "Più alla Moda / Trending"
        let modaList = list.filter(item => item.isAllaModa === true || item.isAllaModa === 'true');
        if (modaList.length === 0) {
            // Fallback automatico: street food ed esperienze trendy
            modaList = list.filter(i => (i.category || '').includes('Street') || (i.category || '').includes('Esperienz')).slice(0, 3);
            if (modaList.length === 0) modaList = list.slice(Math.max(0, list.length - 3));
        }

        this.renderConsigliatiSection(consigliatiList);
        this.renderModaSection(modaList);
    }

    renderConsigliatiSection(tours) {
        const container = document.getElementById('sezione-consigliati-container');
        if (!container || tours.length === 0) return;

        container.innerHTML = `
            <div class="consigliati-moda-header">
                <div class="consigliati-moda-title-box">
                    <h2 class="consigliati-moda-title">
                        ⭐ Consigliati per Te
                    </h2>
                    <p class="consigliati-moda-subtitle">I tour e gli itinerari più amati dai viaggiatori scelti per te dalle nostre guide esperti.</p>
                </div>
                <span class="badge-consigliato">⭐ Selezione Esclusiva</span>
            </div>

            <div class="consigliati-grid">
                ${tours.map(tour => this.renderTourCardHTML(tour, 'consigliato')).join('')}
            </div>
        `;
    }

    renderModaSection(tours) {
        const container = document.getElementById('sezione-moda-container');
        if (!container || tours.length === 0) return;

        container.innerHTML = `
            <div class="consigliati-moda-header" style="margin-top: 50px;">
                <div class="consigliati-moda-title-box">
                    <h2 class="consigliati-moda-title">
                        🔥 Più alla Moda & Trending
                    </h2>
                    <p class="consigliati-moda-subtitle">I luoghi più cliccati del momento, le esperienze culinarie ed i tour fotografici imperdibili.</p>
                </div>
                <span class="badge-moda">🔥 Trend del Mese</span>
            </div>

            <div class="consigliati-grid">
                ${tours.map(tour => this.renderTourCardHTML(tour, 'moda')).join('')}
            </div>
        `;
    }

    renderTourCardHTML(item, tipo) {
        const coverImg = (item.images && item.images.length > 0) ? item.images[0] : (item.imageUrl || 'https://via.placeholder.com/400x250?text=Palermo+Tour');
        const badgeLabel = tipo === 'consigliato' ? '⭐ Consigliato' : '🔥 Più alla Moda';
        const badgeClass = tipo === 'consigliato' ? 'badge-consigliato' : 'badge-moda';

        return `
            <div class="tour-card-special">
                <div class="tour-card-img-box">
                    <img src="${coverImg}" alt="${this.escapeHtml(item.title)}" loading="lazy">
                    <div class="tour-card-top-tag">
                        <span class="${badgeClass}">${badgeLabel}</span>
                    </div>
                    <div class="tour-card-price-tag">
                        💰 ${this.escapeHtml(item.price || 'Da 25€')}
                    </div>
                </div>

                <div class="tour-card-body">
                    <div class="tour-card-category">🏛️ ${this.escapeHtml(item.category || 'Tour Palermo')}</div>
                    <h3 class="tour-card-title">${this.escapeHtml(item.title)}</h3>
                    <p class="tour-card-desc">${this.escapeHtml(item.shortDesc || item.fullDesc || 'Scopri le meraviglie di Palermo con la nostra guida esperta.')}</p>

                    <div class="tour-card-footer">
                        <span class="tour-card-duration">⏱️ ${this.escapeHtml(item.duration || '3 Ore')}</span>
                        <button type="button" class="btn-card-action" onclick="consigliatiModaManager.apriDettaglioTour('${item.id}')">
                            🎟️ Dettagli & Prenota
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    apriDettaglioTour(tourId) {
        if (typeof window.mostraDettaglio === 'function') {
            window.mostraDettaglio(tourId);
        } else if (typeof window.apriModalDettaglio === 'function') {
            window.apriModalDettaglio(tourId);
        } else {
            window.location.href = `prenotazioni/prenotazione.html?tourId=${tourId}`;
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Istanza globale del modulo autonomo
window.consigliatiModaManager = new ConsigliatiModaManager();
