/**
 * MODULO AUTONOMO DATABASE CLOUD - JSONBin.io
 * Sicily Palermo Tour - Sincronizzazione in Tempo Reale Itinerari e Prenotazioni per Ospiti e Admin
 */

const JSONBIN_MASTER_KEY = '$2a$10$Owm0ELeIld8ZySHzLaBKzOPUfHMcdB.4b1WoCRGHc35w3AG3c/qfK';
const BIN_ID_STORAGE_KEY = 'spt_jsonbin_id';

class CloudDatabaseManager {
    constructor() {
        this.masterKey = JSONBIN_MASTER_KEY;
        this.binId = localStorage.getItem(BIN_ID_STORAGE_KEY) || '';
    }

    // Ottiene il Bin ID del Database Cloud (con recupero automatico se il browser è un Ospite nuovo)
    async getOrCreateBinId() {
        if (this.binId && this.binId.length >= 15) {
            return this.binId;
        }

        // 1. Cerca se esiste già un Bin creato su JSONBin per questo account
        try {
            const res = await fetch('https://api.jsonbin.io/v3/c/uncategorized/bins', {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.masterKey
                }
            });

            if (res.ok) {
                const listData = await res.json();
                if (Array.isArray(listData) && listData.length > 0) {
                    const foundId = listData[0].record;
                    if (foundId) {
                        this.binId = foundId;
                        localStorage.setItem(BIN_ID_STORAGE_KEY, this.binId);
                        console.log("☁️ Bin ID Cloud trovato e sincronizzato per l'Ospite:", this.binId);
                        return this.binId;
                    }
                }
            }
        } catch (e) {
            console.error("Errore ricerca Bin Cloud:", e);
        }

        // 2. Se non esiste ancora alcun Bin, lo crea per la prima volta
        try {
            let defaultItinerari = [];
            try {
                defaultItinerari = JSON.parse(localStorage.getItem('spt_itineraries') || '[]');
            } catch (e) {}

            const res = await fetch('https://api.jsonbin.io/v3/b', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey,
                    'X-Bin-Private': 'false',
                    'X-Bin-Name': 'SicilyPalermoTour_Database'
                },
                body: JSON.stringify({ itinerari: defaultItinerari, bookings: [] })
            });

            if (res.ok) {
                const data = await res.json();
                this.binId = data.metadata.id;
                localStorage.setItem(BIN_ID_STORAGE_KEY, this.binId);
                console.log("☁️ Nuovo Database Cloud Inizializzato! Bin ID:", this.binId);
                return this.binId;
            }
        } catch (e) {
            console.error("Errore creazione Bin Cloud:", e);
        }

        return null;
    }

    // Scarica gli itinerari pubblicati dal Cloud per qualsiasi Ospite o Turista
    async fetchItinerariCloud() {
        const binId = await this.getOrCreateBinId();
        if (!binId) return null;

        try {
            const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.masterKey
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.record && data.record.itinerari && Array.isArray(data.record.itinerari) && data.record.itinerari.length > 0) {
                    localStorage.setItem('spt_itineraries', JSON.stringify(data.record.itinerari));
                    return data.record.itinerari;
                }
            }
        } catch (e) {
            console.error("Errore lettura itinerari da Cloud:", e);
        }
        return null;
    }

    // Salva e pubblica i nuovi itinerari nel Cloud per tutti i turisti del mondo
    async salvaItinerariCloud(itinerariList) {
        const binId = await this.getOrCreateBinId();
        if (!binId) return false;

        try {
            let currentBookings = [];
            try {
                currentBookings = JSON.parse(localStorage.getItem('spt_bookings') || '[]');
            } catch (e) {}

            const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey
                },
                body: JSON.stringify({
                    itinerari: itinerariList,
                    bookings: currentBookings,
                    updatedAt: new Date().toISOString()
                })
            });

            if (res.ok) {
                console.log("☁️ Itinerari Pubblicati ed Aggiornati con successo nel Cloud!");
                localStorage.setItem('spt_itineraries', JSON.stringify(itinerariList));
                return true;
            }
        } catch (e) {
            console.error("Errore salvataggio itinerari nel Cloud:", e);
        }
        return false;
    }

    // Salva le prenotazioni nel Cloud
    async salvaPrenotazioniCloud(bookingsList) {
        const binId = await this.getOrCreateBinId();
        if (!binId) return;

        try {
            let currentItinerari = [];
            try {
                currentItinerari = JSON.parse(localStorage.getItem('spt_itineraries') || '[]');
            } catch (e) {}

            await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey
                },
                body: JSON.stringify({
                    itinerari: currentItinerari,
                    bookings: bookingsList,
                    updatedAt: new Date().toISOString()
                })
            });
        } catch (e) {
            console.error("Errore salvataggio prenotazioni Cloud:", e);
        }
    }
}

// Istanza globale gestore Database Cloud
window.cloudDB = new CloudDatabaseManager();
