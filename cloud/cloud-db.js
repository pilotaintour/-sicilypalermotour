/**
 * MODULO AUTONOMO DATABASE CLOUD - JSONBin.io
 * Sicily Palermo Tour - Sincronizzazione AUTOMATICA E CONTINUA IN BACKGROUND (Real-Time Auto-Sync)
 */

const JSONBIN_MASTER_KEY = '$2a$10$Owm0ELeIld8ZySHzLaBKzOPUfHMcdB.4b1WoCRGHc35w3AG3c/qfK';
const BIN_ID_STORAGE_KEY = 'spt_jsonbin_id';

class CloudDatabaseManager {
    constructor() {
        this.masterKey = JSONBIN_MASTER_KEY;
        this.binId = localStorage.getItem(BIN_ID_STORAGE_KEY) || '';
        this.syncInterval = null;

        // Inizia la sincronizzazione automatica continua a ciclo in background
        this.initAutoSync();
    }

    initAutoSync() {
        // 1. Sync immediato all'avvio
        setTimeout(() => this.fetchTuttiDatiCloud(), 300);

        // 2. Poll automatico in background ogni 10 secondi per aggiornare tutti i browser collegati
        if (!this.syncInterval) {
            this.syncInterval = setInterval(() => {
                this.fetchTuttiDatiCloud();
            }, 10000);
        }

        // 3. Sincronizzazione istantanea quando l'utente/admin torna sulla scheda del browser o torna online
        window.addEventListener('focus', () => this.fetchTuttiDatiCloud());
        window.addEventListener('online', () => this.fetchTuttiDatiCloud());
    }

    // Ottiene o recupera automaticamente l'ID del Database Cloud condiviso
    async getOrCreateBinId() {
        if (this.binId && this.binId.length >= 15) {
            return this.binId;
        }

        try {
            const res = await fetch('https://api.jsonbin.io/v3/c/uncategorized/bins', {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.masterKey
                }
            });

            if (res.ok) {
                const listData = await res.json();
                const binsArray = Array.isArray(listData) ? listData : (listData.records || listData.bins || []);

                if (binsArray.length > 0) {
                    const foundId = binsArray[0].id || binsArray[0].record || (binsArray[0].metadata && binsArray[0].metadata.id);
                    if (foundId) {
                        this.binId = foundId;
                        localStorage.setItem(BIN_ID_STORAGE_KEY, this.binId);
                        return this.binId;
                    }
                }
            }
        } catch (e) {}

        try {
            let defaultItinerari = [];
            try { defaultItinerari = JSON.parse(localStorage.getItem('spt_itineraries') || '[]'); } catch (e) {}

            const res = await fetch('https://api.jsonbin.io/v3/b', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey,
                    'X-Bin-Private': 'false',
                    'X-Bin-Name': 'SicilyPalermoTour_Database'
                },
                body: JSON.stringify({ itinerari: defaultItinerari, heroPhotos: [], bookings: [], reviews: [] })
            });

            if (res.ok) {
                const data = await res.json();
                this.binId = data.metadata.id;
                localStorage.setItem(BIN_ID_STORAGE_KEY, this.binId);
                return this.binId;
            }
        } catch (e) {}

        return null;
    }

    _getCurrentLocalData() {
        let itinerari = [];
        let heroPhotos = [];
        let bookings = [];
        let reviews = [];
        try { itinerari = JSON.parse(localStorage.getItem('spt_itineraries') || '[]'); } catch (e) {}
        try { heroPhotos = JSON.parse(localStorage.getItem('spt_hero_photos') || '[]'); } catch (e) {}
        try { bookings = JSON.parse(localStorage.getItem('spt_bookings') || '[]'); } catch (e) {}
        try { reviews = JSON.parse(localStorage.getItem('spt_recensioni') || '[]'); } catch (e) {}
        return { itinerari, heroPhotos, bookings, reviews };
    }

    // Scarica e sincronizza in tempo reale in background TUTTI i dati (Itinerari, Foto, Prenotazioni, Recensioni)
    async fetchTuttiDatiCloud() {
        const binId = await this.getOrCreateBinId();
        if (!binId) return null;

        try {
            const timestamp = Date.now();
            const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest?nocache=${timestamp}`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.masterKey,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });

            if (res.ok) {
                const data = await res.json();
                const record = data.record || {};

                // 1. Sincronizza e renderizza Itinerari
                if (record.itinerari && Array.isArray(record.itinerari)) {
                    localStorage.setItem('spt_itineraries', JSON.stringify(record.itinerari));
                    if (typeof renderItinerariGrid === 'function') {
                        const cat = typeof categoriaSelezionata !== 'undefined' ? categoriaSelezionata : 'Tutti';
                        renderItinerariGrid(record.itinerari, cat);
                    }
                    if (typeof caricaElencoItinerari === 'function') caricaElencoItinerari();
                }

                // 2. Sincronizza Hero Photos
                if (record.heroPhotos && Array.isArray(record.heroPhotos)) {
                    localStorage.setItem('spt_hero_photos', JSON.stringify(record.heroPhotos));
                }

                // 3. Sincronizza Prenotazioni
                if (record.bookings && Array.isArray(record.bookings)) {
                    localStorage.setItem('spt_bookings', JSON.stringify(record.bookings));
                    if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
                }

                // 4. Sincronizza e renderizza Recensioni
                if (record.reviews && Array.isArray(record.reviews)) {
                    localStorage.setItem('spt_recensioni', JSON.stringify(record.reviews));
                    if (typeof renderRecensioniGrid === 'function') renderRecensioniGrid();
                    if (typeof caricaRecensioniAdmin === 'function') caricaRecensioniAdmin();
                }

                return record;
            }
        } catch (e) {
            // Silenzioso in background
        }
        return null;
    }

    async fetchItinerariCloud() { return this.fetchTuttiDatiCloud(); }
    async fetchRecensioniCloud() { return this.fetchTuttiDatiCloud(); }

    // Salva automaticamente qualunque modifica nel Cloud
    async salvaTuttiDatiCloud(dataObj) {
        const binId = await this.getOrCreateBinId();
        if (!binId) return false;

        try {
            const current = this._getCurrentLocalData();
            const payload = {
                itinerari: typeof dataObj.itinerari !== 'undefined' ? dataObj.itinerari : current.itinerari,
                heroPhotos: typeof dataObj.heroPhotos !== 'undefined' ? dataObj.heroPhotos : current.heroPhotos,
                bookings: typeof dataObj.bookings !== 'undefined' ? dataObj.bookings : current.bookings,
                reviews: typeof dataObj.reviews !== 'undefined' ? dataObj.reviews : current.reviews,
                updatedAt: new Date().toISOString()
            };

            const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (dataObj.itinerari) localStorage.setItem('spt_itineraries', JSON.stringify(dataObj.itinerari));
                if (dataObj.heroPhotos) localStorage.setItem('spt_hero_photos', JSON.stringify(dataObj.heroPhotos));
                if (dataObj.bookings) localStorage.setItem('spt_bookings', JSON.stringify(dataObj.bookings));
                if (dataObj.reviews) localStorage.setItem('spt_recensioni', JSON.stringify(dataObj.reviews));

                // Notifica aggiornamento istantaneo
                setTimeout(() => this.fetchTuttiDatiCloud(), 200);
                return true;
            }
        } catch (e) {
            console.error("Errore salvataggio Cloud:", e);
        }
        return false;
    }

    async salvaItinerariCloud(itinerariList) {
        return this.salvaTuttiDatiCloud({ itinerari: itinerariList });
    }

    async salvaFotoHeroCloud(heroPhotosList) {
        return this.salvaTuttiDatiCloud({ heroPhotos: heroPhotosList });
    }

    async salvaRecensioniCloud(recensioniList) {
        return this.salvaTuttiDatiCloud({ reviews: recensioniList });
    }

    async salvaPrenotazioniCloud(bookingsList) {
        return this.salvaTuttiDatiCloud({ bookings: bookingsList });
    }
}

// Istanza globale gestore Database Cloud con auto-sync avviato
window.cloudDB = new CloudDatabaseManager();
