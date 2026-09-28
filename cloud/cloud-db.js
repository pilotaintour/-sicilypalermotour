/**
 * MODULO AUTONOMO DATABASE CLOUD - FIREBASE REALTIME DATABASE (GOOGLE)
 * Sicily Palermo Tour - Sincronizzazione in Tempo Reale Illimitata (1GB Gratis, Nessun Limite di Chiamate)
 */

const FIREBASE_DB_URL = 'https://sicilypalermotour-default-rtdb.europe-west1.firebasedatabase.app/spt_database.json';

function pulisciVecchiItinerariDemo(lista) {
    if (!Array.isArray(lista)) return [];
    return lista.filter(item => {
        if (!item) return false;
        const id = String(item.id || '');
        // Rimuove solo i vecchi ID '1', '2', '3' dei tour predefiniti hardcoded
        return !(id === '1' || id === '2' || id === '3');
    });
}

class CloudDatabaseManager {
    constructor() {
        this.dbUrl = FIREBASE_DB_URL;
        this.syncInterval = null;
        this.isSaving = false;

        // Inizia la sincronizzazione automatica continua in background
        this.initAutoSync();
    }

    initAutoSync() {
        // 1. Sync immediato all'avvio
        setTimeout(() => this.fetchTuttiDatiCloud(), 300);

        // 2. Poll automatico veloce in background ogni 6 secondi (senza alcun limite su Firebase)
        if (!this.syncInterval) {
            this.syncInterval = setInterval(() => {
                this.fetchTuttiDatiCloud();
            }, 6000);
        }

        // 3. Sincronizzazione istantanea quando l'utente/admin torna sulla scheda del browser o torna online
        window.addEventListener('focus', () => this.fetchTuttiDatiCloud());
        window.addEventListener('online', () => this.fetchTuttiDatiCloud());
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

    // Scarica e sincronizza in tempo reale in background TUTTI i dati da Firebase
    async fetchTuttiDatiCloud() {
        if (this.isSaving) return null;

        try {
            const timestamp = Date.now();
            const res = await fetch(`${this.dbUrl}?nocache=${timestamp}`, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });

            if (res.ok && !this.isSaving) {
                const record = (await res.json()) || {};

                // 1. Sincronizza e renderizza Itinerari
                if (record.itinerari && Array.isArray(record.itinerari)) {
                    const itinerariPuliti = pulisciVecchiItinerariDemo(record.itinerari);
                    localStorage.setItem('spt_itineraries', JSON.stringify(itinerariPuliti));

                    if (typeof renderItinerariGrid === 'function') {
                        const cat = typeof categoriaSelezionata !== 'undefined' ? categoriaSelezionata : 'Tutti';
                        renderItinerariGrid(itinerariPuliti, cat);
                    }
                    if (typeof caricaElencoItinerari === 'function') caricaElencoItinerari();
                } else if (!record.itinerari) {
                    localStorage.setItem('spt_itineraries', JSON.stringify([]));
                    if (typeof renderItinerariGrid === 'function') renderItinerariGrid([], 'Tutti');
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

    // Salva automaticamente qualunque modifica nel Firebase Cloud
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

            const res = await fetch(this.dbUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                console.log("🔥 Dati pubblicati con successo su Firebase Realtime Database!");
                this.isSaving = false;
                setTimeout(() => this.fetchTuttiDatiCloud(), 200);
                return true;
            }
        } catch (e) {
            console.error("Errore salvataggio Firebase:", e);
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
