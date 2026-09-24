/**
 * MODULO 2: Cartelle Itinerari, Orari Prenotati & Lista Ufficiale Passeggeri
 * Sicily Palermo Tour - Admin
 */

const BOOKINGS_STORAGE_KEY = 'spt_bookings';

let tourSelezionatoCartella = null; // null = Mostra Griglia Cartelle Tour; string = Titolo Tour aperto
let vistaAttualePrenotazioni = 'EXCEL'; // 'SCHEDE' oppure 'EXCEL'
let filtroStatoPrenotazioni = 'TUTTI';
let filtroDataSelezionata = 'TUTTI';
let filtroOrarioSelezionato = 'TUTTI';
let ricercaPrenotazioniText = '';

// Recupera le prenotazioni dal localStorage
function getPrenotazioniAdmin() {
    try {
        const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY) || '[]';
        return JSON.parse(saved);
    } catch (e) {
        console.error("Errore lettura prenotazioni:", e);
        return [];
    }
}

// Salva le prenotazioni nel localStorage
function savePrenotazioniAdmin(list) {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(list));
}

// Apre la cartella prenotazioni di un determinato itinerario
function apriCartellaTour(titoloTour) {
    tourSelezionatoCartella = titoloTour;
    filtroDataSelezionata = 'TUTTI';
    filtroOrarioSelezionato = 'TUTTI';
    caricaPrenotazioniAdmin();
}

// Torna alla griglia generale di tutte le cartelle itinerari
function chiudiCartellaTour() {
    tourSelezionatoCartella = null;
    filtroDataSelezionata = 'TUTTI';
    filtroOrarioSelezionato = 'TUTTI';
    caricaPrenotazioniAdmin();
}

// Cambia la modalità tra vista Schede e vista Excel all'interno del tour
function impostaVistaPrenotazioni(modo) {
    vistaAttualePrenotazioni = modo;
    caricaPrenotazioniAdmin();
}

// Funzione principale di rendering
function caricaPrenotazioniAdmin() {
    const listContainer = document.getElementById('admin-bookings-list');
    const badgeCount = document.getElementById('cnt-prenotazioni-badge');

    if (!listContainer) return;

    let bookings = getPrenotazioniAdmin();

    if (badgeCount) badgeCount.textContent = bookings.length;

    if (bookings.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #64748b;">
                <h3 style="color: #1b4f72;">📥 Nessuna prenotazione ricevuta al momento</h3>
                <p>Le prenotazioni effettuate dai turisti dal sito compariranno qui ordinate per itinerario ed orario.</p>
            </div>
        `;
        return;
    }

    // SCENARIO A: Nessun Tour Selezionato -> Mostra la Griglia delle Cartelle Itinerari
    if (!tourSelezionatoCartella) {
        listContainer.innerHTML = renderGrigliaCartelleItinerari(bookings);
        return;
    }

    // SCENARIO B: Tour Selezionato -> Mostra la Vista Dettagliata per quell'Itinerario
    const bookingsDelTour = bookings.filter(b => b.tourTitle === tourSelezionatoCartella);
    listContainer.innerHTML = renderDettaglioCartellaTour(tourSelezionatoCartella, bookingsDelTour);
}

// Renderizza la Griglia di Cartelle degli Itinerari
function renderGrigliaCartelleItinerari(allBookings) {
    let itinerariConfig = [];
    try {
        itinerariConfig = JSON.parse(localStorage.getItem('spt_itineraries') || '[]');
    } catch (e) {
        itinerariConfig = [];
    }

    const tourMappa = {};

    allBookings.forEach(b => {
        const title = b.tourTitle || 'Tour Palermo';
        if (!tourMappa[title]) {
            tourMappa[title] = {
                title: title,
                countBookings: 0,
                totalPassengers: 0,
                timeSlotsSet: new Set(),
                bookings: []
            };
        }
        tourMappa[title].countBookings++;
        const numPasseggeri = (b.participantsList && b.participantsList.length > 0) ? b.participantsList.length : (b.adults + b.children);
        tourMappa[title].totalPassengers += numPasseggeri;
        if (b.time) tourMappa[title].timeSlotsSet.add(b.time);
        tourMappa[title].bookings.push(b);
    });

    const titoliMappa = Object.keys(tourMappa);

    let html = `
        <div style="margin-bottom: 22px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
                <h3 style="color: #0b2545; margin: 0; font-size: 1.25rem;">📂 Cartelle Prenotazioni per Itinerario</h3>
                <p style="color: #64748b; font-size: 0.88rem; margin: 4px 0 0 0;">Clicca su un itinerario per accedere alla lista passeggeri e filtrare per orario prenotato.</p>
            </div>
            <button type="button" class="btn-secondary btn-small" style="background:#059669; color:#fff;" onclick="esportaRegistroExcelCSVAll()">
                📥 Esporta CSV di Tutti i Tour
            </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
    `;

    titoliMappa.forEach(title => {
        const itemTour = tourMappa[title];
        const config = itinerariConfig.find(i => i.title === title) || {};
        const coverImg = (config.images && config.images.length > 0) ? config.images[0] : (config.imageUrl || 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=600');
        const orariArray = Array.from(itemTour.timeSlotsSet).sort();

        html += `
            <div onclick="apriCartellaTour('${escapeHtmlBooking(title)}')" style="background: #ffffff; border: 2px solid #cbd5e1; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.04); cursor: pointer; transition: all 0.25s ease; position: relative;" onmouseover="this.style.borderColor='#0b2545'; this.style.transform='translateY(-3px)';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.transform='none';">
                <div style="height: 130px; overflow: hidden; position: relative;">
                    <img src="${coverImg}" alt="${escapeHtmlBooking(title)}" style="width: 100%; height: 100%; object-fit: cover;">
                    <span style="position: absolute; top: 10px; right: 10px; background: rgba(11, 37, 69, 0.88); backdrop-filter: blur(4px); color: #ffffff; padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: bold;">
                        ${itemTour.countBookings} Prenotazioni
                    </span>
                </div>

                <div style="padding: 18px;">
                    <h4 style="color: #0b2545; margin: 0 0 8px 0; font-size: 1.15rem; font-weight: 800;">
                        🏛️ ${escapeHtmlBooking(title)}
                    </h4>

                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                        <span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 8px; font-size: 0.8rem; font-weight: bold;">
                            👥 ${itemTour.totalPassengers} Passeggeri
                        </span>
                        ${orariArray.map(o => `<span style="background:#fef3c7; color:#92400e; padding:3px 8px; border-radius:8px; font-size:0.78rem; font-weight:bold;">⏰ ${o}</span>`).join('')}
                    </div>

                    <button type="button" class="btn-primary" style="width: 100%; background: linear-gradient(135deg, #0b2545, #134074); padding: 10px; font-size: 0.9rem; font-weight: 800; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        📂 Apri Prenotazioni Tour →
                    </button>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

// Calcola il conteggio dei passeggeri per un determinato orario
function getConteggioPasseggeriOrario(bookingsList, timeStr) {
    let cnt = 0;
    bookingsList.forEach(b => {
        if (timeStr === 'TUTTI' || b.time === timeStr) {
            cnt += (b.participantsList && b.participantsList.length > 0) ? b.participantsList.length : (b.adults + b.children);
        }
    });
    return cnt;
}

// Renderizza la vista Dettaglio Cartella di un Singolo Tour
function renderDettaglioCartellaTour(titoloTour, bookingsOfTour) {
    let itinerariConfig = [];
    try {
        itinerariConfig = JSON.parse(localStorage.getItem('spt_itineraries') || '[]');
    } catch (e) {
        itinerariConfig = [];
    }
    const tourConfig = itinerariConfig.find(i => i.title === titoloTour) || {};

    let configTimeSlots = [];
    if (tourConfig.timeSlots && Array.isArray(tourConfig.timeSlots)) {
        configTimeSlots = tourConfig.timeSlots.map(t => typeof t === 'string' ? t : (t && t.time)).filter(Boolean);
    }
    const bookingTimeSlots = bookingsOfTour.map(b => b.time).filter(Boolean);

    const orariUnici = [...new Set([...configTimeSlots, ...bookingTimeSlots])].sort();
    const dateUniche = [...new Set(bookingsOfTour.map(b => b.dateReadable || b.dateISO).filter(Boolean))];

    let html = `
        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 22px; box-shadow: 0 4px 14px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button type="button" class="btn-secondary btn-small" onclick="chiudiCartellaTour()" style="background: #f1f5f9; color: #0b2545; border: 1.5px solid #cbd5e1; font-weight: bold;">
                        ← Torna a Tutti gli Itinerari
                    </button>
                    <h3 style="color: #0b2545; margin: 0; font-size: 1.3rem; font-weight: 800;">
                        🏛️ Tour: ${escapeHtmlBooking(titoloTour)}
                    </h3>
                </div>

                <!-- PULSANTI AZIONE: ESPORTAZIONE EXCEL, CONDIVISIONE WHATSAPP, STAMPA PDF -->
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button type="button" class="btn-secondary btn-small" style="background:#059669; color:#ffffff; font-weight:bold;" onclick="esportaRegistroExcelCSVParticolare('${escapeHtmlBooking(titoloTour)}')">
                        📊 Scarica Excel (.CSV)
                    </button>
                    <button type="button" class="btn-secondary btn-small" style="background:#25d366; color:#ffffff; font-weight:bold;" onclick="condividiFileExcelWhatsApp('${escapeHtmlBooking(titoloTour)}')">
                        📲 Condividi File Excel / WhatsApp
                    </button>
                    <button type="button" class="btn-secondary btn-small" style="background:#0284c7; color:#ffffff; font-weight:bold;" onclick="stampaFoglioPresenzeGuidaParticolare('${escapeHtmlBooking(titoloTour)}')">
                        📄 Salva PDF / Stampa Manifest
                    </button>
                    <button type="button" class="btn-secondary btn-small" style="background:#6366f1; color:#ffffff;" onclick="inviaListaEmailAgenzia('${escapeHtmlBooking(titoloTour)}')">
                        📧 Invia Email
                    </button>
                </div>
            </div>

            <!-- PULSANTI INTERATTIVI DI SELEZIONE ORARIO PRENOTATO -->
            <div style="margin-bottom: 16px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 14px; border-radius: 12px; border: 1px solid #bae6fd;">
                <div style="font-size: 0.9rem; font-weight: 800; color: #0369a1; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    ⏰ Clicca un Orario per generare la Lista Unica dei Partecipanti:
                </div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <button type="button" class="btn-secondary btn-small" style="${filtroOrarioSelezionato === 'TUTTI' ? 'background:#0b2545; color:#ffffff; font-weight:bold; box-shadow:0 3px 10px rgba(11,37,69,0.25);' : 'background:#ffffff; color:#334155; border:1.5px solid #cbd5e1;'}" onclick="filtroOrarioSelezionato = 'TUTTI'; caricaPrenotazioniAdmin();">
                        Tutti gli Orari (${getConteggioPasseggeriOrario(bookingsOfTour, 'TUTTI')} pers)
                    </button>
                    ${orariUnici.map(timeStr => `
                        <button type="button" class="btn-secondary btn-small" style="${filtroOrarioSelezionato === timeStr ? 'background:#0b2545; color:#ffffff; font-weight:bold; box-shadow:0 3px 10px rgba(11,37,69,0.3); border-color:#0b2545;' : 'background:#ffffff; color:#0b2545; border:1.5px solid #cbd5e1;'}" onclick="filtroOrarioSelezionato = '${timeStr}'; caricaPrenotazioniAdmin();">
                            ⏰ Ore ${timeStr} (${getConteggioPasseggeriOrario(bookingsOfTour, timeStr)} pers)
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Filtri Data, Stato, Modalità e Ricerca dentro il Tour -->
            <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;">
                <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                    <div>
                        <select onchange="filtroDataSelezionata = this.value; caricaPrenotazioniAdmin();" style="padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.88rem; font-weight: 600; color: #0b2545;">
                            <option value="TUTTI">📅 Tutte le Date (${dateUniche.length})</option>
                            ${dateUniche.map(d => `<option value="${escapeHtmlBooking(d)}" ${filtroDataSelezionata === d ? 'selected' : ''}>${escapeHtmlBooking(d)}</option>`).join('')}
                        </select>
                    </div>

                    <div>
                        <select onchange="setFiltroPrenotazioni(this.value);" style="padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.88rem; font-weight: 600; color: #0b2545;">
                            <option value="TUTTI" ${filtroStatoPrenotazioni === 'TUTTI' ? 'selected' : ''}>🏷️ Tutti gli Stati</option>
                            <option value="In attesa" ${filtroStatoPrenotazioni === 'In attesa' ? 'selected' : ''}>In Attesa</option>
                            <option value="Confermata" ${filtroStatoPrenotazioni === 'Confermata' ? 'selected' : ''}>Confermate</option>
                            <option value="Cancellata" ${filtroStatoPrenotazioni === 'Cancellata' ? 'selected' : ''}>Annullate</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 4px;">
                        <button type="button" class="btn-secondary btn-small" style="padding: 6px 10px; ${vistaAttualePrenotazioni === 'EXCEL' ? 'background:#0b2545; color:#fff;' : 'background:#f1f5f9; color:#334155;'}" onclick="impostaVistaPrenotazioni('EXCEL')">📊 Lista Unica</button>
                        <button type="button" class="btn-secondary btn-small" style="padding: 6px 10px; ${vistaAttualePrenotazioni === 'SCHEDE' ? 'background:#0b2545; color:#fff;' : 'background:#f1f5f9; color:#334155;'}" onclick="impostaVistaPrenotazioni('SCHEDE')">📋 Schede</button>
                    </div>
                </div>

                <div>
                    <input type="text" id="admin-search-booking" placeholder="🔎 Cerca Nome o Codice..." value="${escapeHtmlBooking(ricercaPrenotazioniText)}" oninput="cercaPrenotazioniAdmin(this.value)" style="padding: 7px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.88rem; width: 200px;">
                </div>
            </div>
        </div>
    `;

    // Filtra per Data, Orario Selezionato e Stato
    let filtrate = bookingsOfTour.filter(b => {
        const dateStr = b.dateReadable || b.dateISO;
        if (filtroDataSelezionata !== 'TUTTI' && dateStr !== filtroDataSelezionata) return false;

        if (filtroOrarioSelezionato !== 'TUTTI' && b.time !== filtroOrarioSelezionato) return false;

        if (filtroStatoPrenotazioni !== 'TUTTI' && b.status !== filtroStatoPrenotazioni) return false;

        if (ricercaPrenotazioniText) {
            const term = ricercaPrenotazioniText.toLowerCase();
            const matchCode = (b.code || '').toLowerCase().includes(term);
            const matchName = (b.customerName || '').toLowerCase().includes(term);
            const matchEmail = (b.customerEmail || '').toLowerCase().includes(term);

            const matchPasseggero = b.participantsList && b.participantsList.some(p => (p.name || '').toLowerCase().includes(term));
            return matchCode || matchName || matchEmail || matchPasseggero;
        }
        return true;
    });

    if (vistaAttualePrenotazioni === 'EXCEL') {
        html += renderRegistroExcelPasseggeri(filtrate, titoloTour);
    } else {
        html += renderSchedePrenotazioni(filtrate);
    }

    return html;
}

// Genera la vista Tabella Lista Unica Passeggeri (Identica alla Stampa PDF / Guida)
function renderRegistroExcelPasseggeri(bookingsList, titoloTour) {
    if (bookingsList.length === 0) {
        return `
            <div style="text-align: center; padding: 30px; color: #64748b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
                <p>Nessun passeggero trovato per l'orario e i filtri selezionati.</p>
            </div>
        `;
    }

    const righePasseggeri = [];
    let counter = 1;

    bookingsList.forEach(b => {
        if (b.participantsList && b.participantsList.length > 0) {
            b.participantsList.forEach((p, idxP) => {
                righePasseggeri.push({
                    rowNum: counter++,
                    bookingId: b.id,
                    code: b.code || '#SPT-BOOK',
                    tourTitle: b.tourTitle || 'Tour Palermo',
                    dateStr: b.dateReadable || b.dateISO || 'N/D',
                    timeStr: b.time || '09:30',
                    passengerName: p.name || 'N/D',
                    passengerType: p.type || (idxP === 0 ? 'Referente' : 'Adulto'),
                    passengerDob: p.dob || 'N/D',
                    passengerOrigin: p.origin || 'N/D',
                    passengerNotes: p.notes || '',
                    leadEmail: b.customerEmail || 'N/D',
                    leadPhone: b.customerPhone || 'N/D',
                    status: b.status || 'In attesa'
                });
            });
        } else {
            righePasseggeri.push({
                rowNum: counter++,
                bookingId: b.id,
                code: b.code || '#SPT-BOOK',
                tourTitle: b.tourTitle || 'Tour Palermo',
                dateStr: b.dateReadable || b.dateISO || 'N/D',
                timeStr: b.time || '09:30',
                passengerName: b.customerName || 'N/D',
                passengerType: 'Referente',
                passengerDob: 'N/D',
                passengerOrigin: 'N/D',
                passengerNotes: b.notes || '',
                leadEmail: b.customerEmail || 'N/D',
                leadPhone: b.customerPhone || 'N/D',
                status: b.status || 'In attesa'
            });
        }
    });

    const infoOrarioTitolo = (filtroOrarioSelezionato !== 'TUTTI') ? ` - Ore ${filtroOrarioSelezionato}` : '';

    return `
        <div style="background: #ffffff; border: 1.5px solid #000000; border-radius: 8px; padding: 22px; box-shadow: 0 4px 14px rgba(0,0,0,0.05); margin-top: 10px;">
            <div style="border-bottom: 2px solid #000000; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
                <div>
                    <h3 style="color: #0b2545; margin: 0; font-size: 1.4rem; font-weight: 800;">
                        🏛️ Sicily Palermo Tour - Lista Ufficiale Passeggeri
                    </h3>
                    <p style="color: #475569; font-size: 0.9rem; margin: 4px 0 0 0;">
                        Tour: <strong>${escapeHtmlBooking(titoloTour || 'Palermo Tour')}</strong>${infoOrarioTitolo} | Documento Guida del ${new Date().toLocaleDateString('it-IT')}
                    </p>
                </div>
                <span style="font-size: 0.88rem; font-weight: bold; background: #f1f5f9; color: #0b2545; padding: 6px 14px; border-radius: 12px; border: 1px solid #cbd5e1;">
                    Totale ${righePasseggeri.length} Passeggeri
                </span>
            </div>

            <div style="max-height: 560px; overflow-x: auto; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; background: #ffffff;">
                    <thead>
                        <tr style="background: #ffffff; color: #000000; font-weight: 800; border-bottom: 2px solid #000000; position: sticky; top: 0; z-index: 10;">
                            <th style="padding: 10px 8px; border: 1px solid #000000; text-align: center; width: 48px; background: #ffffff;">Check</th>
                            <th style="padding: 10px 8px; border: 1px solid #000000; text-align: center; width: 32px; background: #ffffff;">#</th>
                            <th style="padding: 10px 8px; border: 1px solid #000000; background: #ffffff;">Passeggero</th>
                            <th style="padding: 10px 8px; border: 1px solid #000000; background: #ffffff;">Tipo</th>
                            <th style="padding: 10px 8px; border: 1px solid #000000; background: #ffffff;">Data Nascita</th>
                            <th style="padding: 10px 8px; border: 1px solid #000000; background: #ffffff;">Provenienza</th>
                            <th style="padding: 10px 8px; border: 1px solid #000000; background: #ffffff;">Tour</th>
                            <th style="padding: 10px 8px; border: 1px solid #000000; background: #ffffff;">Data & Ora</th>
                            <th style="padding: 10px 8px; border: 1px solid #000000; background: #ffffff;">Telefono</th>
                            <th style="padding: 10px 8px; border: 1px solid #000000; background: #ffffff;">Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${righePasseggeri.map((r) => `
                            <tr style="background: #ffffff; border-bottom: 1px solid #cbd5e1;">
                                <td style="padding: 10px 8px; border: 1px solid #000000; text-align: center; color: #1e293b; font-family: monospace; font-size: 0.95rem;">[ &nbsp; ]</td>
                                <td style="padding: 10px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; color: #1e293b;">${r.rowNum}</td>
                                <td style="padding: 10px 8px; border: 1px solid #000000; font-weight: 800; color: #000000;">${escapeHtmlBooking(r.passengerName)}</td>
                                <td style="padding: 10px 8px; border: 1px solid #000000; font-size: 0.85rem; color: #334155;">${escapeHtmlBooking(r.passengerType)}</td>
                                <td style="padding: 10px 8px; border: 1px solid #000000; color: #1e293b; font-weight: 600;">${escapeHtmlBooking(r.passengerDob)}</td>
                                <td style="padding: 10px 8px; border: 1px solid #000000; color: #1e293b;">${escapeHtmlBooking(r.passengerOrigin)}</td>
                                <td style="padding: 10px 8px; border: 1px solid #000000; font-weight: 600; color: #0b2545;">${escapeHtmlBooking(r.tourTitle)}</td>
                                <td style="padding: 10px 8px; border: 1px solid #000000; font-weight: 600; color: #334155; font-size: 0.83rem;">${escapeHtmlBooking(r.dateStr)}<br><strong>Ore ${escapeHtmlBooking(r.timeStr)}</strong></td>
                                <td style="padding: 10px 8px; border: 1px solid #000000; font-size: 0.85rem; color: #334155;">${escapeHtmlBooking(r.leadPhone)}</td>
                                <td style="padding: 10px 8px; border: 1px solid #000000; font-size: 0.85rem; color: #475569;">${r.passengerNotes ? escapeHtmlBooking(r.passengerNotes) : '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Genera la vista Schede Singole
function renderSchedePrenotazioni(bookingsList) {
    if (bookingsList.length === 0) {
        return `
            <div style="text-align: center; padding: 30px; color: #64748b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
                <p>Nessuna prenotazione corrisponde ai filtri selezionati.</p>
            </div>
        `;
    }

    return bookingsList.map((b) => {
        const isConfermata = b.status === 'Confermata';
        const isCancellata = b.status === 'Cancellata';
        const borderColor = isConfermata ? '#10b981' : (isCancellata ? '#ef4444' : '#1b4f72');
        const statusBg = isConfermata ? '#d1fae5; color:#065f46;' : (isCancellata ? '#fee2e2; color:#991b1b;' : '#fef3c7; color:#92400e;');

        return `
            <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-left: 5px solid ${borderColor}; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                    <div>
                        <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: bold; font-family: monospace;">${escapeHtmlBooking(b.code || '#SPT-BOOK')}</span>
                        <strong style="color: #1b4f72; font-size: 1.15rem; margin-left: 8px;">${escapeHtmlBooking(b.tourTitle)}</strong>
                    </div>
                    <div>
                        <span style="font-weight: bold; font-size: 0.85rem; padding: 5px 12px; border-radius: 14px; background: ${statusBg};">
                            ${escapeHtmlBooking(b.status || 'In attesa')}
                        </span>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; font-size: 0.9rem; color: #334155; margin-bottom: 14px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div>📅 <strong>Data:</strong> ${escapeHtmlBooking(b.dateReadable || b.dateISO)}</div>
                    <div>⏰ <strong>Orario:</strong> ${escapeHtmlBooking(b.time || '09:30')}</div>
                    <div>🎟️ <strong>Ospiti:</strong> ${b.adults} Adulti ${b.children > 0 ? `, ${b.children} Bambini` : ''}</div>
                    <div>💰 <strong>Totale:</strong> €${escapeHtmlBooking(b.total || '0.00')}</div>
                </div>

                <div style="font-size: 0.92rem; color: #475569; margin-bottom: 14px;">
                    👤 <strong>Referente:</strong> ${escapeHtmlBooking(b.customerName)} | 📧 ${escapeHtmlBooking(b.customerEmail)} | 📞 ${escapeHtmlBooking(b.customerPhone)}

                    ${b.participantsList && b.participantsList.length > 0 ? `
                        <div style="margin-top: 10px; background: #fafcfd; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <strong style="color: #1b4f72;">🧳 Passeggeri / Partecipanti (${b.participantsList.length}):</strong>
                            <ol style="margin: 6px 0 0 18px; padding: 0; font-size: 0.88rem; color: #1e293b; line-height: 1.6;">
                                ${b.participantsList.map(p => `
                                    <li style="margin-bottom: 4px;">
                                        <strong>${escapeHtmlBooking(p.name)}</strong> (${p.dob ? 'Nato/a il ' + escapeHtmlBooking(p.dob) : (p.age ? escapeHtmlBooking(p.age) + ' anni' : escapeHtmlBooking(p.type))}${p.origin ? ' - da ' + escapeHtmlBooking(p.origin) : ''})
                                        ${p.notes ? `<div style="font-size:0.82rem; color:#64748b; margin-top:2px;">📝 <em>Note: ${escapeHtmlBooking(p.notes)}</em></div>` : ''}
                                    </li>
                                `).join('')}
                            </ol>
                        </div>
                    ` : ''}

                    ${b.notes ? `<div style="margin-top: 8px; font-size:0.88rem;">📝 <strong>Note Generali:</strong> <em>"${escapeHtmlBooking(b.notes)}"</em></div>` : ''}
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0;">
                    <button type="button" class="btn-primary btn-small" style="background-color: #25d366;" onclick="apriChatWhatsAppCliente('${escapeHtmlBooking(b.customerPhone)}', '${escapeHtmlBooking(b.customerName)}', '${escapeHtmlBooking(b.tourTitle)}')">💬 Chatta su WhatsApp</button>
                    <button type="button" class="btn-secondary btn-small" style="background-color: #10b981;" onclick="cambiaStatoPrenotazione('${b.id}', 'Confermata')">✅ Conferma</button>
                    <button type="button" class="btn-secondary btn-small" style="background-color: #f59e0b;" onclick="cambiaStatoPrenotazione('${b.id}', 'Cancellata')">⚠️ Annulla</button>
                    <button type="button" class="btn-danger btn-small" onclick="eliminaPrenotazioneAdmin('${b.id}')">🗑️ Elimina</button>
                </div>
            </div>
        `;
    }).join('');
}

// CONDIVISIONE DIRETTA FILE EXCEL SU WHATSAPP O WEB SHARE
function condividiFileExcelWhatsApp(titoloTour) {
    let list = getPrenotazioniAdmin();
    if (titoloTour) list = list.filter(b => b.tourTitle === titoloTour);
    if (filtroOrarioSelezionato !== 'TUTTI') list = list.filter(b => b.time === filtroOrarioSelezionato);
    if (filtroDataSelezionata !== 'TUTTI') list = list.filter(b => (b.dateReadable || b.dateISO) === filtroDataSelezionata);

    if (list.length === 0) {
        alert("Nessuna prenotazione presente per l'orario ed il tour selezionato.");
        return;
    }

    const csvContent = generaStringaCSVExcel(list);
    const fileName = `Manifest_Passeggeri_${titoloTour ? titoloTour.replace(/[^a-zA-Z0-9]/g, '_') : 'Tour'}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    if (navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: 'text/csv' })] })) {
        const fileObj = new File([blob], fileName, { type: 'text/csv' });
        navigator.share({
            title: `Manifest Passeggeri - ${titoloTour || 'Sicily Palermo Tour'}`,
            text: `Ecco il file Excel con la lista passeggeri per il tour ${titoloTour || ''} ${filtroOrarioSelezionato !== 'TUTTI' ? 'delle ore ' + filtroOrarioSelezionato : ''}`,
            files: [fileObj]
        }).catch(err => {
            console.log("Condivisione annullata:", err);
        });
    } else {
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        let msg = `🏛️ *SICILY PALERMO TOUR - MANIFEST PASSEGGERI*\n`;
        msg += `📍 Tour: *${titoloTour || 'Palermo Tour'}*\n`;
        if (filtroOrarioSelezionato !== 'TUTTI') msg += `⏰ Orario: *${filtroOrarioSelezionato}*\n`;
        if (filtroDataSelezionata !== 'TUTTI') msg += `📅 Data: *${filtroDataSelezionata}*\n\n`;

        let counter = 1;
        msg += `📋 *LISTA PASSEGGERI:*\n`;
        list.forEach(b => {
            if (b.participantsList && b.participantsList.length > 0) {
                b.participantsList.forEach(p => {
                    msg += `${counter++}. *${p.name}* (${p.type || 'Adulto'}) - Nato/a: ${p.dob || 'N/D'} (da ${p.origin || 'N/D'})\n`;
                });
            }
        });

        msg += `\n📥 *Allegato:* Ho appena scaricato il file Excel *${fileName}*, te lo trascino qui in chat!`;

        alert(`📥 File Excel "${fileName}" scaricato sul tuo dispositivo!\n\nOra si aprirà WhatsApp: trascina semplicemente il file scaricato nella chat dell'agenzia.`);

        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
    }
}

// Genera la stringa CSV Excel formattata in modo pulito
function generaStringaCSVExcel(bookingsList) {
    let csv = "\uFEFF";
    csv += "N°;PASSEGGERO (NOME E COGNOME);RUOLO / TIPO;DATA DI NASCITA;PROVENIENZA;ITINERARIO TOUR;DATA TOUR;ORARIO TOUR;NOTE PASSEGGERO;REFERENTE PRENOTAZIONE;TELEFONO REFERENTE;EMAIL REFERENTE;CODICE BOOKING;STATO PRENOTAZIONE\n";

    let counter = 1;
    bookingsList.forEach(b => {
        if (b.participantsList && b.participantsList.length > 0) {
            b.participantsList.forEach(p => {
                const row = [
                    counter++,
                    `"${(p.name || '').replace(/"/g, '""')}"`,
                    `"${(p.type || '').replace(/"/g, '""')}"`,
                    `"${(p.dob || '').replace(/"/g, '""')}"`,
                    `"${(p.origin || '').replace(/"/g, '""')}"`,
                    `"${(b.tourTitle || '').replace(/"/g, '""')}"`,
                    `"${(b.dateReadable || b.dateISO || '').replace(/"/g, '""')}"`,
                    `"${(b.time || '').replace(/"/g, '""')}"`,
                    `"${(p.notes || '').replace(/"/g, '""')}"`,
                    `"${(b.customerName || '').replace(/"/g, '""')}"`,
                    `"${(b.customerPhone || '').replace(/"/g, '""')}"`,
                    `"${(b.customerEmail || '').replace(/"/g, '""')}"`,
                    `"${(b.code || '').replace(/"/g, '""')}"`,
                    `"${(b.status || 'In attesa').replace(/"/g, '""')}"`
                ];
                csv += row.join(";") + "\n";
            });
        }
    });

    return csv;
}

// Esporta CSV di un singolo Tour ed eventualmente singolo Orario
function esportaRegistroExcelCSVParticolare(titoloTour) {
    let list = getPrenotazioniAdmin();
    if (titoloTour) {
        list = list.filter(b => b.tourTitle === titoloTour);
    }
    if (filtroOrarioSelezionato !== 'TUTTI') {
        list = list.filter(b => b.time === filtroOrarioSelezionato);
    }
    const suffix = filtroOrarioSelezionato !== 'TUTTI' ? `_Ore_${filtroOrarioSelezionato.replace(':', '_')}` : '';
    esportaListaCSV(list, `Manifest_${titoloTour ? titoloTour.replace(/[^a-zA-Z0-9]/g, '_') : 'Tutti_Tour'}${suffix}`);
}

function esportaRegistroExcelCSVAll() {
    esportaListaCSV(getPrenotazioniAdmin(), "Manifest_Tutti_I_Tour_Palermo");
}

function esportaListaCSV(bookingsList, filenamePrefix) {
    if (bookingsList.length === 0) {
        alert("Nessuna prenotazione presente da esportare.");
        return;
    }

    const csvContent = generaStringaCSVExcel(bookingsList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filenamePrefix}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Invia lista via Email all'Agenzia
function inviaListaEmailAgenzia(titoloTour) {
    let list = getPrenotazioniAdmin();
    if (titoloTour) list = list.filter(b => b.tourTitle === titoloTour);
    if (filtroOrarioSelezionato !== 'TUTTI') list = list.filter(b => b.time === filtroOrarioSelezionato);
    if (filtroDataSelezionata !== 'TUTTI') list = list.filter(b => (b.dateReadable || b.dateISO) === filtroDataSelezionata);

    if (list.length === 0) {
        alert("Nessuna prenotazione presente per i filtri selezionati.");
        return;
    }

    let subject = `[Manifest Passeggeri] Tour: ${titoloTour || 'Palermo'}`;
    if (filtroOrarioSelezionato !== 'TUTTI') subject += ` - Ore ${filtroOrarioSelezionato}`;

    let body = `SICILY PALERMO TOUR - MANIFEST PASSEGGERI UFFICIALE\n`;
    body += `Tour: ${titoloTour || 'Palermo Tour'}\n`;
    if (filtroOrarioSelezionato !== 'TUTTI') body += `Orario: ${filtroOrarioSelezionato}\n`;
    if (filtroDataSelezionata !== 'TUTTI') body += `Data: ${filtroDataSelezionata}\n\n`;

    let counter = 1;
    body += `LISTA PASSEGGERI:\n`;
    list.forEach(b => {
        if (b.participantsList && b.participantsList.length > 0) {
            b.participantsList.forEach(p => {
                body += `${counter++}. ${p.name} (${p.type || 'Adulto'}) - Nato/a il ${p.dob || 'N/D'} da ${p.origin || 'N/D'}\n`;
                if (p.notes) body += `   Note: ${p.notes}\n`;
            });
        }
    });

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
}

// Stampa Registro Guida o Salva in PDF di un Tour per Orario (Format Esatto Immagine)
function stampaFoglioPresenzeGuidaParticolare(titoloTour) {
    let list = getPrenotazioniAdmin();
    if (titoloTour) {
        list = list.filter(b => b.tourTitle === titoloTour);
    }
    if (filtroOrarioSelezionato !== 'TUTTI') {
        list = list.filter(b => b.time === filtroOrarioSelezionato);
    }

    if (list.length === 0) {
        alert("Nessuna prenotazione presente da stampare per questo orario.");
        return;
    }

    const printWin = window.open('', '_blank');
    let rowsHtml = '';
    let counter = 1;

    list.forEach(b => {
        if (b.participantsList && b.participantsList.length > 0) {
            b.participantsList.forEach(p => {
                rowsHtml += `
                    <tr>
                        <td style="text-align:center;">[ &nbsp; ]</td>
                        <td style="text-align:center;">${counter++}</td>
                        <td><strong>${p.name || 'N/D'}</strong></td>
                        <td>${p.type || 'Adulto'}</td>
                        <td>${p.dob || '-'}</td>
                        <td>${p.origin || '-'}</td>
                        <td>${b.tourTitle || 'Tour Palermo'}</td>
                        <td>${b.dateReadable || b.dateISO}<br><strong>Ore ${b.time || '09:30'}</strong></td>
                        <td>${b.customerPhone || '-'}</td>
                        <td>${p.notes || '-'}</td>
                    </tr>
                `;
            });
        }
    });

    const infoOrario = filtroOrarioSelezionato !== 'TUTTI' ? ` - Ore ${filtroOrarioSelezionato}` : '';

    printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Lista Passeggeri Guida - Sicily Palermo Tour</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 25px; color: #1e293b; background: #ffffff; }
                .header-box { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
                h1 { color: #0b2545; font-size: 1.4rem; margin: 0; font-weight: 800; }
                p { color: #64748b; font-size: 0.88rem; margin-top: 4px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.85rem; }
                th, td { border: 1px solid #94a3b8; padding: 8px 10px; text-align: left; }
                th { background: #ffffff; color: #0f172a; font-weight: 800; border-bottom: 2px solid #0f172a; }
                tr:nth-child(even) { background: #f8fafc; }
            </style>
        </head>
        <body>
            <div class="header-box">
                <h1>🏛️ Sicily Palermo Tour - Lista Ufficiale Passeggeri ${infoOrario}</h1>
            </div>
            <p>Tour: <strong>${titoloTour || 'Tutti i Tour'}</strong> | Documento Guida / PDF del ${new Date().toLocaleString('it-IT')}</p>

            <table>
                <thead>
                    <tr>
                        <th style="text-align:center; width: 45px;">Check</th>
                        <th style="text-align:center; width: 30px;">#</th>
                        <th>Passeggero</th>
                        <th>Tipo</th>
                        <th>Data Nascita</th>
                        <th>Provenienza</th>
                        <th>Tour</th>
                        <th>Data & Ora</th>
                        <th>Telefono</th>
                        <th>Note</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
            <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
    `);
    printWin.document.close();
}

function setFiltroPrenotazioni(stato) {
    filtroStatoPrenotazioni = stato;
    caricaPrenotazioniAdmin();
}

function cercaPrenotazioniAdmin(query) {
    ricercaPrenotazioniText = query.trim();
    caricaPrenotazioniAdmin();
}

function cambiaStatoPrenotazione(id, nuovoStato) {
    let list = getPrenotazioniAdmin();
    list = list.map(b => {
        if (String(b.id) === String(id)) {
            b.status = nuovoStato;
        }
        return b;
    });
    savePrenotazioniAdmin(list);
    caricaPrenotazioniAdmin();
}

function eliminaPrenotazioneAdmin(id) {
    if (!confirm('Sei sicuro di voler eliminare definitivamente questa prenotazione?')) return;
    let list = getPrenotazioniAdmin();
    list = list.filter(b => String(b.id) !== String(id));
    savePrenotazioniAdmin(list);
    caricaPrenotazioniAdmin();
}

function apriChatWhatsAppCliente(telefono, nome, tour) {
    const cleanNum = telefono.replace(/[^0-9]/g, '');
    const msg = `Ciao ${nome}! Ti contattiamo da Sicily Palermo Tour riguardo la tua prenotazione per il tour "${tour}".`;
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
}

function escapeHtmlBooking(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#032;");
}
