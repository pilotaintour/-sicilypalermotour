/**
 * MODULO AUTONOMO ARCHIVIO STORICO TOUR & PRENOTAZIONI PASSATE
 * Sicily Palermo Tour - Admin
 * Sposta automaticamente i tour e gli orari con data/ora già trascorse
 * nell'Archivio Storico per tenere pulito l'itinerario principale giorno per giorno.
 */

class AdminArchivioManager {
    constructor() {
        this.vistaAttivaArchivio = 'ATTIVE'; // 'ATTIVE' oppure 'ARCHIVIO'
    }

    // Controlla se la data e l'orario di una prenotazione sono già passati
    isPrenotazionePassata(b) {
        if (!b) return false;
        const dateISO = b.dateISO || '';
        if (!dateISO) return false;

        try {
            const timeParts = (b.time || b.slotTime || '23:59').split(':');
            const hh = parseInt(timeParts[0], 10) || 0;
            const mm = parseInt(timeParts[1], 10) || 0;

            const dateBooking = new Date(dateISO);
            dateBooking.setHours(hh, mm, 59, 999);

            const adesso = new Date();
            return dateBooking < adesso;
        } catch (e) {
            return false;
        }
    }

    // Separa la lista completa in Prenotazioni Attive (Prossime) e Passate (Archiviate)
    separaPrenotazioni(allBookings) {
        const attive = [];
        const passate = [];

        allBookings.forEach(b => {
            if (this.isPrenotazionePassata(b)) {
                passate.push(b);
            } else {
                attive.push(b);
            }
        });

        return { attive, passate };
    }

    // Renderizza il Box dell'Archivio Storico
    renderSezioneArchivio(passateList) {
        if (passateList.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: #64748b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 15px;">
                    <h3 style="color: #0b2545; margin-top: 0;">🗄️ L'Archivio Storico è vuoto</h3>
                    <p>I tour e gli orari già conclusi verranno archiviati qui automaticamente quando il tempo sarà trascorso.</p>
                </div>
            `;
        }

        // Raggruppa le prenotazioni archiviate per Tour, Data ed Orario
        const mappaArchivio = {};

        passateList.forEach(b => {
            const key = `${b.tourTitle || 'Tour'}_${b.dateReadable || b.dateISO}_${b.time || '09:30'}`;
            if (!mappaArchivio[key]) {
                mappaArchivio[key] = {
                    tourTitle: b.tourTitle || 'Tour Palermo',
                    dateStr: b.dateReadable || b.dateISO,
                    timeStr: b.time || '09:30',
                    bookings: []
                };
            }
            mappaArchivio[key].bookings.push(b);
        });

        const gruppiArchiviati = Object.values(mappaArchivio);

        let html = `
            <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                    <div>
                        <h3 style="color: #0b2545; margin: 0; font-size: 1.2rem;">🗄️ Archivio Storico Tour Conclusi (${passateList.length} prenotazioni passate)</h3>
                        <p style="color: #64748b; font-size: 0.88rem; margin: 4px 0 0 0;">Queste liste sono state archiviate in automatico perché l'orario del tour è già trascorso.</p>
                    </div>
                    <button type="button" class="btn-danger btn-small" onclick="adminArchivio.svuotaTuttoArchivio()">
                        🗑️ Svuota Tutto l'Archivio Storico
                    </button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 15px;">
        `;

        gruppiArchiviati.forEach(g => {
            let totPasseggeri = 0;
            g.bookings.forEach(b => {
                totPasseggeri += (b.participantsList && b.participantsList.length > 0) ? b.participantsList.length : (b.adults + b.children);
            });

            html += `
                <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-left: 5px solid #64748b; border-radius: 10px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <strong style="color: #0b2545; font-size: 1.05rem;">🏛️ ${escapeHtmlBooking(g.tourTitle)}</strong>
                            <span style="font-size: 0.85rem; color: #475569; margin-left: 10px;">📅 Data: <strong>${escapeHtmlBooking(g.dateStr)}</strong> | ⏰ Ore <strong>${escapeHtmlBooking(g.timeStr)}</strong></span>
                            <span style="background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 10px; font-size: 0.78rem; font-weight: bold; margin-left: 8px;">
                                ${totPasseggeri} Passeggeri
                            </span>
                        </div>

                        <div style="display: flex; gap: 8px;">
                            <button type="button" class="btn-secondary btn-small" onclick="adminArchivio.stampaArchivioParticolare('${escapeHtmlBooking(g.tourTitle)}', '${escapeHtmlBooking(g.dateStr)}', '${escapeHtmlBooking(g.timeStr)}')">
                                📄 Stampa / PDF
                            </button>
                            <button type="button" class="btn-danger btn-small" onclick="adminArchivio.eliminaGruppoArchivio('${escapeHtmlBooking(g.tourTitle)}', '${escapeHtmlBooking(g.dateStr)}', '${escapeHtmlBooking(g.timeStr)}')">
                                🗑️ Elimina Questa Lista
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        return html;
    }

    // Elimina un singolo orario/data dall'archivio
    eliminaGruppoArchivio(tourTitle, dateStr, timeStr) {
        if (!confirm(`Sei sicuro di voler eliminare definitivamente le prenotazioni archiviate per "${tourTitle}" (${dateStr} ore ${timeStr})?`)) return;

        let list = getPrenotazioniAdmin();
        list = list.filter(b => {
            const matchTour = b.tourTitle === tourTitle;
            const matchDate = (b.dateReadable || b.dateISO) === dateStr;
            const matchTime = b.time === timeStr;
            return !(matchTour && matchDate && matchTime && this.isPrenotazionePassata(b));
        });

        savePrenotazioniAdmin(list);
        caricaPrenotazioniAdmin();
    }

    // Svuota completamente l'archivio
    svuotaTuttoArchivio() {
        if (!confirm("Sei sicuro di voler eliminare DEFINITIVAMENTE TUTTE le prenotazioni passate nell'archivio storico?")) return;

        let list = getPrenotazioniAdmin();
        list = list.filter(b => !this.isPrenotazionePassata(b));
        savePrenotazioniAdmin(list);
        caricaPrenotazioniAdmin();
    }

    // Stampa un foglio dell'archivio
    stampaArchivioParticolare(tourTitle, dateStr, timeStr) {
        if (typeof stampaFoglioPresenzeGuidaParticolare === 'function') {
            stampaFoglioPresenzeGuidaParticolare(tourTitle);
        }
    }
}

// Istanza globale gestore archivio storico
window.adminArchivio = new AdminArchivioManager();
