/**
 * MODULO AUTONOMO DATABASE CLOUD - JSONBin.io
 * Sicily Palermo Tour - Sincronizzazione AUTOMATICA E CONTINUA IN BACKGROUND (Real-Time Auto-Sync)
 */

const JSONBIN_MASTER_KEY = '$2a$10$t1PzsRamZS7b4O1oQc70a.HnjyJH4THbu.yRHU7MlW79xJqi/NuJ6';
const BIN_ID_STORAGE_KEY = 'spt_jsonbin_id';
const SHARED_BIN_ID = '6ab99856ac6210605afc0c9d';

function pulisciVecchiItinerariDemo(lista) {
    if (!Array.isArray(lista)) return [];
    return lista.filter(item => {
        if (!item) return false;
        const title = (item.title || '').trim().toLowerCase();
        const id = String(item.id || '');
        const isOld1 = (id === '1' || title.includes('arabo-normanna'));
        const isOld2 = (id === '2' || title.includes('tour del gusto') || title.includes('street food'));
        const isOld3 = (id === '3' || title.includes('mondello e il barocco'));
        return !(isOld1 || isOld2 || isOld3);
    });
}

class CloudDatabaseManager {
    constructor() {
        this.masterKey = JSONBIN_MASTER_KEY;
        this.binId = SHARED_BIN_ID;
        localStorage.setItem(BIN_ID_STORAGE_KEY, SHARED_BIN_ID);

        this.syncInterval = null;
        this.isSaving = false;

        // Inizia la sincronizzazione automatica continua in background
        this.initAutoSync();
    }

    initAutoSync() {
        // 1. Sync immediato all'avvio
        setTimeout(() => this.fetchTuttiDatiCloud(), 300);

        // 2. Poll automatico in background ogni 10 secondi per tutti i visitatori
        if (!this.syncInterval) {
            this.syncInterval = setInterval(() => {
                this.fetchTuttiDatiCloud();
            }, 10000);
        }

        // 3. Sincronizzazione istantanea quando l'utente/admin torna sulla scheda del browser
        window.addEventListener('focus', () => this.fetchTuttiDatiCloud());
        window.addEventListener('online', () => this.fetchTuttiDatiCloud());
    }

    async getOrCreateBinId() {
        return SHARED_BIN_ID;
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

        itinerari = pulisciVecchiItinerariDemo(itinerari);
        return { itinerari, heroPhotos, bookings, reviews };
    }

    // Scarica e sincronizza in tempo reale in background TUTTI i dati (Itinerari, Foto, Prenotazioni, Recensioni)
    async fetchTuttiDatiCloud() {
        if (this.isSaving) return null;

        try {
            const timestamp = Date.now();
            const res = await fetch(`https://api.jsonbin.io/v3/b/${SHARED_BIN_ID}/latest?nocache=${timestamp}`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.masterKey,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });

            if (res.ok && !this.isSaving) {
                const data = await res.json();
                const record = data.record || {};

                // 1. Sincronizza e renderizza Itinerari
                if (record.itinerari && Array.isArray(record.itinerari)) {
                    const itinerariPuliti = pulisciVecchiItinerariDemo(record.itinerari);
                    localStorage.setItem('spt_itineraries', JSON.stringify(itinerariPuliti));

                    if (typeof renderItinerariGrid === 'function') {
                        const cat = typeof categoriaSelezionata !== 'undefined' ? categoriaSelezionata : 'Tutti';
                        renderItinerariGrid(itinerariPuliti, cat);
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
        this.isSaving = true;

        try {
            if (typeof dataObj.itinerari !== 'undefined') {
                const cleanItinerari = pulisciVecchiItinerariDemo(dataObj.itinerari);
                localStorage.setItem('spt_itineraries', JSON.stringify(cleanItinerari));
            }
            if (typeof dataObj.heroPhotos !== 'undefined') {
                localStorage.setItem('spt_hero_photos', JSON.stringify(dataObj.heroPhotos));
            }
            if (typeof dataObj.bookings !== 'undefined') {
                localStorage.setItem('spt_bookings', JSON.stringify(dataObj.bookings));
            }
            if (typeof dataObj.reviews !== 'undefined') {
                localStorage.setItem('spt_recensioni', JSON.stringify(dataObj.reviews));
            }

            const current = this._getCurrentLocalData();
            const payload = {
                itinerari: current.itinerari,
                heroPhotos: current.heroPhotos,
                bookings: current.bookings,
                reviews: current.reviews,
                updatedAt: new Date().toISOString()
            };

            const res = await fetch(`https://api.jsonbin.io/v3/b/${SHARED_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                console.log("☁️ Dati pubblicati con successo nel Cloud!");
                this.isSaving = false;
                return true;
            }
        } catch (e) {
            console.error("Errore salvataggio Cloud:", e);
        } finally {
            this.isSaving = false;
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
