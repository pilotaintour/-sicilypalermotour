/**
 * MODULO AUTONOMO DATABASE CLOUD - FIREBASE REALTIME DATABASE (GOOGLE)
 * Sicily Palermo Tour - Sincronizzazione in Tempo Reale con Unione Intelligente e Protezione Dati
 */

const FIREBASE_DB_URL = 'https://sicilypalermotour-default-rtdb.europe-west1.firebasedatabase.app/spt_database.json';

function pulisciVecchiItinerariDemo(lista) {
    if (!Array.isArray(lista)) return [];
    return lista.filter(item => {
        if (!item) return false;
        const id = String(item.id || '');
        return !(id === '1' || id === '2' || id === '3');
    });
}

class CloudDatabaseManager {
    constructor() {
        this.dbUrl = FIREBASE_DB_URL;
        this.syncInterval = null;
        this.isSaving = false;

        this.initAutoSync();
    }

    initAutoSync() {
        setTimeout(() => this.fetchTuttiDatiCloud(), 300);

        if (!this.syncInterval) {
            this.syncInterval = setInterval(() => {
                this.fetchTuttiDatiCloud();
            }, 5000);
        }

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

                // 1. Sincronizza Itinerari
                if (record.itinerari && Array.isArray(record.itinerari) && record.itinerari.length > 0) {
                    const itinerariPuliti = pulisciVecchiItinerariDemo(record.itinerari);
                    localStorage.setItem('spt_itineraries', JSON.stringify(itinerariPuliti));

                    if (typeof renderItinerariGrid === 'function') {
                        const cat = typeof categoriaSelezionata !== 'undefined' ? categoriaSelezionata : 'Tutti';
                        renderItinerariGrid(itinerariPuliti, cat);
                    }
                    if (typeof caricaElencoItinerari === 'function') caricaElencoItinerari();
                }

                // 2. Sincronizza Hero Photos
                if (record.heroPhotos && Array.isArray(record.heroPhotos) && record.heroPhotos.length > 0) {
                    localStorage.setItem('spt_hero_photos', JSON.stringify(record.heroPhotos));
                }

                // 3. Unione Intelligente Prenotazioni & Transazioni (Senza mai cancellare le prenotazioni locali)
                if (record.bookings && Array.isArray(record.bookings)) {
                    let localBookings = [];
                    try { localBookings = JSON.parse(localStorage.getItem('spt_bookings') || '[]'); } catch (e) {}

                    const mappaBookings = {};
                    // Prima aggiungi le locali
                    localBookings.forEach(b => {
                        const key = b.id || b.code || (b.createdAt + '_' + b.customerEmail);
                        mappaBookings[key] = b;
                    });
                    // Poi unisci quelle dal Cloud
                    record.bookings.forEach(b => {
                        const key = b.id || b.code || (b.createdAt + '_' + b.customerEmail);
                        mappaBookings[key] = b;
                    });

                    const unioneBookings = Object.values(mappaBookings).sort((a, b) => {
                        return (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0);
                    });

                    localStorage.setItem('spt_bookings', JSON.stringify(unioneBookings));

                    if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
                    if (typeof caricaSezioneTransazioni === 'function') caricaSezioneTransazioni();
                }

                // 4. Sincronizza Recensioni
                if (record.reviews && Array.isArray(record.reviews) && record.reviews.length > 0) {
                    localStorage.setItem('spt_recensioni', JSON.stringify(record.reviews));
                    if (typeof renderRecensioniGrid === 'function') renderRecensioniGrid();
                    if (typeof caricaRecensioniAdmin === 'function') caricaRecensioniAdmin();
                }

                return record;
            }
        } catch (e) {
            // Silenzioso
        }
        return null;
    }

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
