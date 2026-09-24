/**
 * Modulo Autonomo Gestione Prenotazioni Ricevute - Sicily Palermo Tour Admin
 * Gestisce il caricamento, filtri, stato prenotazioni, stampa e messaggistica clienti.
 */

const BOOKINGS_STORAGE_KEY = 'spt_bookings';

class AdminPrenotazioniManager {
    constructor() {
        this.filtroStatoAttuale = 'TUTTI';
        this.ricercaTesto = '';
    }

    getPrenotazioni() {
        try {
            return JSON.parse(localStorage.getItem(BOOKINGS_STORAGE_KEY) || '[]');
        } catch (e) {
            console.error("Errore lettura prenotazioni:", e);
            return [];
        }
    }

    savePrenotazioni(list) {
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(list));
    }

    render() {
        const listContainer = document.getElementById('admin-bookings-list');
        const badgeCount = document.getElementById('cnt-prenotazioni-badge');

        if (!listContainer) return;

        let bookings = this.getPrenotazioni();

        if (badgeCount) badgeCount.textContent = bookings.length;

        if (bookings.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <h3 style="color: #1b4f72;">📥 Nessuna prenotazione ricevuta al momento</h3>
                    <p>Le prenotazioni effettuate dai turisti dal sito compariranno qui in tempo reale.</p>
                </div>
            `;
            return;
        }

        // Barra Filtri e Ricerca Rapida
        let htmlHeader = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <span style="font-size: 0.85rem; font-weight: bold; color: #1b4f72;">Filtra per Stato:</span>
                    <button type="button" class="btn-secondary btn-small" style="${this.filtroStatoAttuale === 'TUTTI' ? 'background:#1b4f72; color:#fff;' : 'background:#e2e8f0; color:#334155;'}" onclick="adminPrenotazioni.setFiltro('TUTTI')">Tutti (${bookings.length})</button>
                    <button type="button" class="btn-secondary btn-small" style="${this.filtroStatoAttuale === 'In attesa' ? 'background:#f59e0b; color:#fff;' : 'background:#e2e8f0; color:#334155;'}" onclick="adminPrenotazioni.setFiltro('In attesa')">In Attesa</button>
                    <button type="button" class="btn-secondary btn-small" style="${this.filtroStatoAttuale === 'Confermata' ? 'background:#10b981; color:#fff;' : 'background:#e2e8f0; color:#334155;'}" onclick="adminPrenotazioni.setFiltro('Confermata')">Confermate</button>
                    <button type="button" class="btn-secondary btn-small" style="${this.filtroStatoAttuale === 'Cancellata' ? 'background:#ef4444; color:#fff;' : 'background:#e2e8f0; color:#334155;'}" onclick="adminPrenotazioni.setFiltro('Cancellata')">Annullate</button>
                </div>
                <div>
                    <input type="text" id="admin-search-booking" placeholder="🔎 Cerca per Nome, Email o Codice..." value="${this.escapeHtml(this.ricercaTesto)}" oninput="adminPrenotazioni.search(this.value)" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; width: 220px;">
                </div>
            </div>
        `;

        // Filtra le prenotazioni in base a Stato e Ricerca
        let filtrate = bookings.filter(b => {
            if (this.filtroStatoAttuale !== 'TUTTI' && b.status !== this.filtroStatoAttuale) {
                return false;
            }
            if (this.ricercaTesto) {
                const term = this.ricercaTesto.toLowerCase();
                const matchCode = (b.code || '').toLowerCase().includes(term);
                const matchName = (b.customerName || '').toLowerCase().includes(term);
                const matchEmail = (b.customerEmail || '').toLowerCase().includes(term);
                const matchTour = (b.tourTitle || '').toLowerCase().includes(term);
                return matchCode || matchName || matchEmail || matchTour;
            }
            return true;
        });

        if (filtrate.length === 0) {
            listContainer.innerHTML = htmlHeader + `
                <div style="text-align: center; padding: 30px; color: #64748b;">
                    <p>Nessuna prenotazione corrisponde ai filtri selezionati.</p>
                </div>
            `;
            return;
        }

        let htmlList = filtrate.map((b) => {
            const isConfermata = b.status === 'Confermata';
            const isCancellata = b.status === 'Cancellata';
            const borderColor = isConfermata ? '#10b981' : (isCancellata ? '#ef4444' : '#1b4f72');
            const statusBg = isConfermata ? '#d1fae5; color:#065f46;' : (isCancellata ? '#fee2e2; color:#991b1b;' : '#fef3c7; color:#92400e;');

            return `
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-left: 5px solid ${borderColor}; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                        <div>
                            <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: bold; font-family: monospace;">${this.escapeHtml(b.code || '#SPT-BOOK')}</span>
                            <strong style="color: #1b4f72; font-size: 1.15rem; margin-left: 8px;">${this.escapeHtml(b.tourTitle)}</strong>
                        </div>
                        <div>
                            <span style="font-weight: bold; font-size: 0.85rem; padding: 5px 12px; border-radius: 14px; background: ${statusBg};">
                                ${this.escapeHtml(b.status || 'In attesa')}
                            </span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; font-size: 0.9rem; color: #334155; margin-bottom: 14px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div>📅 <strong>Data:</strong> ${this.escapeHtml(b.dateReadable || b.dateISO)}</div>
                        <div>⏰ <strong>Orario:</strong> ${this.escapeHtml(b.time || '09:30')}</div>
                        <div>🎟️ <strong>Ospiti:</strong> ${b.adults} Adulti ${b.children > 0 ? `, ${b.children} Bambini` : ''}</div>
                        <div>💰 <strong>Totale:</strong> €${this.escapeHtml(b.total || '0.00')}</div>
                    </div>

                    <div style="font-size: 0.92rem; color: #475569; margin-bottom: 14px;">
                        👤 <strong>Referente:</strong> ${this.escapeHtml(b.customerName)} | 📧 ${this.escapeHtml(b.customerEmail)} | 📞 ${this.escapeHtml(b.customerPhone)}

                        ${b.participantsList && b.participantsList.length > 0 ? `
                            <div style="margin-top: 10px; background: #fafcfd; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <strong style="color: #1b4f72;">🧳 Passeggeri / Partecipanti (${b.participantsList.length}):</strong>
                                <ol style="margin: 6px 0 0 18px; padding: 0; font-size: 0.88rem; color: #1e293b; line-height: 1.6;">
                                    ${b.participantsList.map(p => `
                                        <li style="margin-bottom: 4px;">
                                            <strong>${this.escapeHtml(p.name)}</strong> (${p.dob ? 'Nato/a il ' + this.escapeHtml(p.dob) : (p.age ? this.escapeHtml(p.age) + ' anni' : this.escapeHtml(p.type))}${p.origin ? ' - da ' + this.escapeHtml(p.origin) : ''})
                                            ${p.notes ? `<div style="font-size:0.82rem; color:#64748b; margin-top:2px;">📝 <em>Note: ${this.escapeHtml(p.notes)}</em></div>` : ''}
                                        </li>
                                    `).join('')}
                                </ol>
                            </div>
                        ` : ''}

                        ${b.notes ? `<div style="margin-top: 8px; font-size:0.88rem;">📝 <strong>Note Generali:</strong> <em>"${this.escapeHtml(b.notes)}"</em></div>` : ''}
                    </div>

                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0;">
                        <button type="button" class="btn-primary btn-small" style="background-color: #25d366;" onclick="adminPrenotazioni.apriChatWhatsApp('${this.escapeHtml(b.customerPhone)}', '${this.escapeHtml(b.customerName)}', '${this.escapeHtml(b.tourTitle)}')">💬 Chatta su WhatsApp</button>
                        <button type="button" class="btn-secondary btn-small" style="background-color: #10b981;" onclick="adminPrenotazioni.cambiaStato('${b.id}', 'Confermata')">✅ Conferma</button>
                        <button type="button" class="btn-secondary btn-small" style="background-color: #f59e0b;" onclick="adminPrenotazioni.cambiaStato('${b.id}', 'Cancellata')">⚠️ Annulla</button>
                        <button type="button" class="btn-danger btn-small" onclick="adminPrenotazioni.elimina('${b.id}')">🗑️ Elimina</button>
                    </div>
                </div>
            `;
        }).join('');

        listContainer.innerHTML = htmlHeader + htmlList;
    }

    setFiltro(stato) {
        this.filtroStatoAttuale = stato;
        this.render();
    }

    search(query) {
        this.ricercaTesto = query.trim();
        this.render();
    }

    cambiaStato(id, nuovoStato) {
        let list = this.getPrenotazioni();
        list = list.map(b => {
            if (String(b.id) === String(id)) {
                b.status = nuovoStato;
            }
            return b;
        });
        this.savePrenotazioni(list);
        this.render();
    }

    elimina(id) {
        if (!confirm('Sei sicuro di voler eliminare definitivamente questa prenotazione?')) return;
        let list = this.getPrenotazioni();
        list = list.filter(b => String(b.id) !== String(id));
        this.savePrenotazioni(list);
        this.render();
    }

    apriChatWhatsApp(telefono, nome, tour) {
        const cleanNum = telefono.replace(/[^0-9]/g, '');
        const msg = `Ciao ${nome}! Ti contattiamo da Sicily Palermo Tour riguardo la tua prenotazione per il tour "${tour}".`;
        window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, "&amp;")
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")
                          .replace(/"/g, "&quot;")
                          .replace(/'/g, "&#032;");
    }
}

// Istanza globale gestore prenotazioni Admin
let adminPrenotazioni = null;

document.addEventListener('DOMContentLoaded', () => {
    adminPrenotazioni = new AdminPrenotazioniManager();
});

// Funzione ponte globale richiamata dall'Admin Dashboard
function caricaPrenotazioniAdmin() {
    if (!adminPrenotazioni) {
        adminPrenotazioni = new AdminPrenotazioniManager();
    }
    adminPrenotazioni.render();
}
