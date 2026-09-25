/**
 * MODULO AUTONOMO ARCHIVIO STORICO PER CARTELLE ITINERARIO
 * Sicily Palermo Tour - Admin
 * Organizza i tour passati in Cartelle per Itinerario (es. Itinerario Mare, Itinerario Rossano).
 * Cliccando su un itinerario si vedono unicamente le date e gli orari passati di quel tour.
 */

class AdminArchivioManager {
    constructor() {
        this.tourSelezionatoArchivio = null; // null = Griglia Cartelle Archivio; string = Titolo Tour aperto
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

    // Separa le prenotazioni in Attive (prossime) ed Archiviate (passate)
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

    // Apre la cartella dell'archivio per uno specifico itinerario
    apriCartellaArchivio(titoloTour) {
        this.tourSelezionatoArchivio = titoloTour;
        if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
    }

    // Torna alla griglia delle cartelle dell'Archivio
    chiudiCartellaArchivio() {
        this.tourSelezionatoArchivio = null;
        if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
    }

    // Renderizza la Sezione Archivio
    renderSezioneArchivio(passateList) {
        if (passateList.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: #64748b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 15px;">
                    <h3 style="color: #0b2545; margin-top: 0;">🗄️ L'Archivio Storico è vuoto</h3>
                    <p>I tour e gli orari già conclusi verranno archiviati qui automaticamente quando il tempo sarà trascorso.</p>
                </div>
            `;
        }

        // SCENARIO 1: Nessuna cartella archivio aperta -> Mostra Griglia Cartelle Archivio per Itinerario
        if (!this.tourSelezionatoArchivio) {
            return this.renderGrigliaCartelleArchivio(passateList);
        }

        // SCENARIO 2: Cartella Archivio aperta -> Mostra solo i tour passati di quell'Itinerario
        const passateDelTour = passateList.filter(b => b.tourTitle === this.tourSelezionatoArchivio);
        return this.renderDettaglioCartellaArchivio(this.tourSelezionatoArchivio, passateDelTour);
    }

    // Renderizza la Griglia delle Cartelle Archivio (es. Itinerario Mare, Itinerario Rossano)
    renderGrigliaCartelleArchivio(passateList) {
        let itinerariConfig = [];
        try {
            itinerariConfig = JSON.parse(localStorage.getItem('spt_itineraries') || '[]');
        } catch (e) {}

        const tourMappa = {};

        passateList.forEach(b => {
            const title = b.tourTitle || 'Tour Palermo';
            if (!tourMappa[title]) {
                tourMappa[title] = {
                    title: title,
                    countBookings: 0,
                    totalPassengers: 0,
                    dateSet: new Set()
                };
            }
            tourMappa[title].countBookings++;
            const numPasseggeri = (b.participantsList && b.participantsList.length > 0) ? b.participantsList.length : (b.adults + b.children);
            tourMappa[title].totalPassengers += numPasseggeri;
            if (b.dateReadable || b.dateISO) tourMappa[title].dateSet.add(b.dateReadable || b.dateISO);
        });

        const titoliMappa = Object.keys(tourMappa);

        let html = `
            <div style="margin-bottom: 20px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="color: #0b2545; margin: 0; font-size: 1.25rem;">🗄️ Cartelle Archivio Storico per Itinerario</h3>
                    <p style="color: #64748b; font-size: 0.88rem; margin: 4px 0 0 0;">Clicca su un itinerario (es. <em>Itinerario Mare</em> o <em>Itinerario Rossano</em>) per accedere al suo storico passati.</p>
                </div>
                <button type="button" class="btn-danger btn-small" onclick="adminArchivio.svuotaTuttoArchivio()">
                    🗑️ Svuota Tutto l'Archivio
                </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
        `;

        titoliMappa.forEach(title => {
            const itemTour = tourMappa[title];
            const config = itinerariConfig.find(i => i.title === title) || {};
            const coverImg = (config.images && config.images.length > 0) ? config.images[0] : (config.imageUrl || 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=600');

            html += `
                <div onclick="adminArchivio.apriCartellaArchivio('${escapeHtmlBooking(title)}')" style="background: #ffffff; border: 2px solid #64748b; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.04); cursor: pointer; transition: all 0.25s ease;" onmouseover="this.style.borderColor='#0b2545'; this.style.transform='translateY(-3px)';" onmouseout="this.style.borderColor='#64748b'; this.style.transform='none';">
                    <div style="height: 125px; overflow: hidden; position: relative;">
                        <img src="${coverImg}" alt="${escapeHtmlBooking(title)}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
                        <span style="position: absolute; top: 10px; right: 10px; background: rgba(100, 116, 139, 0.92); backdrop-filter: blur(4px); color: #ffffff; padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: bold;">
                            🗄️ ${itemTour.countBookings} Storici
                        </span>
                    </div>

                    <div style="padding: 16px;">
                        <h4 style="color: #0b2545; margin: 0 0 8px 0; font-size: 1.1rem; font-weight: 800;">
                            🏛️ ${escapeHtmlBooking(title)}
                        </h4>

                        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                            <span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 8px; font-size: 0.8rem; font-weight: bold;">
                                👥 ${itemTour.totalPassengers} Passeggeri Passati
                            </span>
                        </div>

                        <button type="button" class="btn-secondary" style="width: 100%; background: #475569; color: white; padding: 9px; font-size: 0.88rem; font-weight: 800; border-radius: 10px;">
                            🗄️ Apri Storico Tour →
                        </button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    // Renderizza lo Storico delle Date e degli Orari Passati di un singolo Itinerario
    renderDettaglioCartellaArchivio(titoloTour, passateDelTour) {
        // Raggruppa per Data ed Orario
        const mappaDataOrario = {};

        passateDelTour.forEach(b => {
            const dateStr = b.dateReadable || b.dateISO || 'Data Sconosciuta';
            const timeStr = b.time || '09:30';
            const key = `${dateStr}_${timeStr}`;

            if (!mappaDataOrario[key]) {
                mappaDataOrario[key] = {
                    dateStr: dateStr,
                    timeStr: timeStr,
                    bookings: []
                };
            }
            mappaDataOrario[key].bookings.push(b);
        });

        const gruppiSvolti = Object.values(mappaDataOrario);

        let html = `
            <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 18px; margin-bottom: 22px; box-shadow: 0 4px 14px rgba(0,0,0,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 14px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button type="button" class="btn-secondary btn-small" onclick="adminArchivio.chiudiCartellaArchivio()" style="background: #f1f5f9; color: #0b2545; border: 1.5px solid #cbd5e1; font-weight: bold;">
                            ← Torna all'Archivio Itinerari
                        </button>
                        <h3 style="color: #0b2545; margin: 0; font-size: 1.25rem; font-weight: 800;">
                            🗄️ Storico: ${escapeHtmlBooking(titoloTour)}
                        </h3>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 16px;">
        `;

        if (gruppiSvolti.length === 0) {
            html += `<p style="color:#64748b; text-align:center; padding:20px;">Nessun tour passato per questo itinerario.</p>`;
        } else {
            gruppiSvolti.forEach(g => {
                let totPasseggeri = 0;
                g.bookings.forEach(b => {
                    totPasseggeri += (b.participantsList && b.participantsList.length > 0) ? b.participantsList.length : (b.adults + b.children);
                });

                html += `
                    <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-left: 5px solid #475569; border-radius: 10px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
                            <div>
                                <strong style="color: #0b2545; font-size: 1.05rem;">📅 ${escapeHtmlBooking(g.dateStr)} - ⏰ Ore ${escapeHtmlBooking(g.timeStr)}</strong>
                                <span style="background: #e2e8f0; color: #334155; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; margin-left: 10px;">
                                    👥 ${totPasseggeri} Passeggeri Svolti
                                </span>
                            </div>

                            <div style="display: flex; gap: 8px;">
                                <button type="button" class="btn-secondary btn-small" style="background:#0284c7; color:#fff;" onclick="stampaFoglioPresenzeGuidaParticolare('${escapeHtmlBooking(titoloTour)}')">
                                    📄 Salva PDF / Stampa
                                </button>
                                <button type="button" class="btn-danger btn-small" onclick="adminArchivio.eliminaGruppoArchivio('${escapeHtmlBooking(titoloTour)}', '${escapeHtmlBooking(g.dateStr)}', '${escapeHtmlBooking(g.timeStr)}')">
                                    🗑️ Elimina Questa Lista
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

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
}

// Istanza globale gestore archivio storico
window.adminArchivio = new AdminArchivioManager();
