/**
 * MODULO AUTONOMO DATABASE CLOUD - JSONBin.io
 * Sicily Palermo Tour - Sincronizzazione in Tempo Reale Itinerari e Prenotazioni
 */

const JSONBIN_MASTER_KEY = '$2a$10$Owm0ELeIld8ZySHzLaBKzOPUfHMcdB.4b1WoCRGHc35w3AG3c/qfK';
const BIN_ID_STORAGE_KEY = 'spt_jsonbin_id';

class CloudDatabaseManager {
    constructor() {
        this.masterKey = JSONBIN_MASTER_KEY;
        this.binId = localStorage.getItem(BIN_ID_STORAGE_KEY) || '';
    }

    // Inizializza o crea il Bin Cloud se non ancora esistente
    async initBin(initialData) {
        if (this.binId) return this.binId;

        try {
            const res = await fetch('https://api.jsonbin.io/v3/b', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey,
                    'X-Bin-Private': 'false',
                    'X-Bin-Name': 'SicilyPalermoTour_Database'
                },
                body: JSON.stringify(initialData || {})
            });

            if (res.ok) {
                const data = await res.json();
                this.binId = data.metadata.id;
                localStorage.setItem(BIN_ID_STORAGE_KEY, this.binId);
                console.log("☁️ Nuovo Database Cloud Creato con Successo! Bin ID:", this.binId);
                return this.binId;
            }
        } catch (e) {
            console.error("Errore creazione Bin Cloud:", e);
        }
        return null;
    }

    // Scarica gli itinerari pubblicati dal Cloud
    async fetchItinerariCloud() {
        if (!this.binId) return null;

        try {
            const res = await fetch(`https://api.jsonbin.io/v3/b/${this.binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.masterKey
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.record && data.record.itinerari && Array.isArray(data.record.itinerari)) {
                    // Aggiorna anche il localStorage per velocizzare i caricamenti futuri
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
        if (!this.binId) {
            await this.initBin({ itinerari: itinerariList, bookings: [] });
        }

        try {
            // Leggi il record attuale per non sovrascrivere le prenotazioni
            let currentBookings = [];
            try {
                currentBookings = JSON.parse(localStorage.getItem('spt_bookings') || '[]');
            } catch (e) {}

            const res = await fetch(`https://api.jsonbin.io/v3/b/${this.binId}`, {
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
        if (!this.binId) return;

        try {
            let currentItinerari = [];
            try {
                currentItinerari = JSON.parse(localStorage.getItem('spt_itineraries') || '[]');
            } catch (e) {}

            await fetch(`https://api.jsonbin.io/v3/b/${this.binId}`, {
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
