/**
 * MODULO AUTONOMO DATABASE CLOUD - JSONBin.io
 * Sicily Palermo Tour - Sincronizzazione in Tempo Reale Itinerari, Foto Copertina, Prenotazioni e Recensioni
 */

const JSONBIN_MASTER_KEY = '$2a$10$Owm0ELeIld8ZySHzLaBKzOPUfHMcdB.4b1WoCRGHc35w3AG3c/qfK';
const BIN_ID_STORAGE_KEY = 'spt_jsonbin_id';

class CloudDatabaseManager {
    constructor() {
        this.masterKey = JSONBIN_MASTER_KEY;
        this.binId = localStorage.getItem(BIN_ID_STORAGE_KEY) || '';
    }

    // Ottiene o recupera automaticamente l'ID del Database Cloud per qualsiasi dispositivo/Ospite
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
                const binsArray = Array.isArray(listData) ? listData : (listData.records || listData.bins || []);

                if (binsArray.length > 0) {
                    const foundId = binsArray[0].id || binsArray[0].record || (binsArray[0].metadata && binsArray[0].metadata.id);
                    if (foundId) {
                        this.binId = foundId;
                        localStorage.setItem(BIN_ID_STORAGE_KEY, this.binId);
                        console.log("☁️ Database Cloud Sincronizzato! Bin ID condiviso:", this.binId);
                        return this.binId;
                    }
                }
            }
        } catch (e) {
            console.error("Errore recupero lista Bins:", e);
        }

        // 2. Se non esiste ancora, crea un nuovo Bin Cloud iniziale
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
                body: JSON.stringify({ itinerari: defaultItinerari, heroPhotos: [], bookings: [], reviews: [] })
            });

            if (res.ok) {
                const data = await res.json();
                this.binId = data.metadata.id;
                localStorage.setItem(BIN_ID_STORAGE_KEY, this.binId);
                console.log("☁️ Nuovo Database Cloud Creato! Bin ID:", this.binId);
                return this.binId;
            }
        } catch (e) {
            console.error("Errore creazione Bin Cloud:", e);
        }

        return null;
    }

    // Helper per leggere tutti i dati locali correnti
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

    // Scarica tutti i dati pubblicati nel Cloud per qualsiasi Ospite o Turista (Itinerari, Hero Photos, Bookings, Recensioni)
    async fetchItinerariCloud() {
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
                let cloudList = [];
                if (Array.isArray(data.record)) {
                    cloudList = data.record;
                } else if (record && Array.isArray(record.itinerari)) {
                    cloudList = record.itinerari;
                }

                // Sincronizza Hero Photos
                if (record && record.heroPhotos && Array.isArray(record.heroPhotos) && record.heroPhotos.length > 0) {
                    localStorage.setItem('spt_hero_photos', JSON.stringify(record.heroPhotos));
                    if (typeof avviaHeroBgSlider === 'function') {
                        avviaHeroBgSlider();
                    }
                }

                // Sincronizza Recensioni
                if (record && record.reviews && Array.isArray(record.reviews)) {
                    localStorage.setItem('spt_recensioni', JSON.stringify(record.reviews));
                    if (typeof renderRecensioniGrid === 'function') renderRecensioniGrid();
                    if (typeof caricaRecensioniAdmin === 'function') caricaRecensioniAdmin();
                }

                if (cloudList && cloudList.length > 0) {
                    localStorage.setItem('spt_itineraries', JSON.stringify(cloudList));
                    return cloudList;
                }
            }
        } catch (e) {
            console.error("Errore lettura dati da Cloud:", e);
        }
        return null;
    }

    // Scarica specificamente le recensioni dal Cloud
    async fetchRecensioniCloud() {
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
                const reviewsList = record.reviews || record.recensioni;
                if (Array.isArray(reviewsList)) {
                    localStorage.setItem('spt_recensioni', JSON.stringify(reviewsList));
                    if (typeof renderRecensioniGrid === 'function') renderRecensioniGrid();
                    if (typeof caricaRecensioniAdmin === 'function') caricaRecensioniAdmin();
                    return reviewsList;
                }
            }
        } catch (e) {
            console.error("Errore lettura recensioni da Cloud:", e);
        }
        return null;
    }

    // Pubblica gli itinerari nel Cloud
    async salvaItinerariCloud(itinerariList) {
        const binId = await this.getOrCreateBinId();
        if (!binId) return false;

        try {
            const current = this._getCurrentLocalData();
            const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey
                },
                body: JSON.stringify({
                    itinerari: itinerariList,
                    heroPhotos: current.heroPhotos,
                    bookings: current.bookings,
                    reviews: current.reviews,
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

    // Salva e pubblica le foto della copertina Hero nel Cloud
    async salvaFotoHeroCloud(heroPhotosList) {
        const binId = await this.getOrCreateBinId();
        if (!binId) return false;

        try {
            const current = this._getCurrentLocalData();
            const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey
                },
                body: JSON.stringify({
                    itinerari: current.itinerari,
                    heroPhotos: heroPhotosList,
                    bookings: current.bookings,
                    reviews: current.reviews,
                    updatedAt: new Date().toISOString()
                })
            });

            if (res.ok) {
                console.log("☁️ Foto Copertina Pubblicate ed Aggiornate con successo nel Cloud!");
                localStorage.setItem('spt_hero_photos', JSON.stringify(heroPhotosList));
                return true;
            }
        } catch (e) {
            console.error("Errore salvataggio foto copertina nel Cloud:", e);
        }
        return false;
    }

    // Salva e pubblica le recensioni nel Cloud in tempo reale per tutti i visitatori
    async salvaRecensioniCloud(recensioniList) {
        const binId = await this.getOrCreateBinId();
        if (!binId) return false;

        try {
            const current = this._getCurrentLocalData();
            const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey
                },
                body: JSON.stringify({
                    itinerari: current.itinerari,
                    heroPhotos: current.heroPhotos,
                    bookings: current.bookings,
                    reviews: recensioniList,
                    updatedAt: new Date().toISOString()
                })
            });

            if (res.ok) {
                console.log("☁️ Recensioni Pubblicate ed Aggiornate con successo nel Cloud per tutti i turisti!");
                localStorage.setItem('spt_recensioni', JSON.stringify(recensioniList));
                return true;
            }
        } catch (e) {
            console.error("Errore salvataggio recensioni nel Cloud:", e);
        }
        return false;
    }
}

// Istanza globale gestore Database Cloud
window.cloudDB = new CloudDatabaseManager();
