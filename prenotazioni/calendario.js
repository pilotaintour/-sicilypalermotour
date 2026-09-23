/**
 * Modulo Calendario Interattivo Avanzato - Sicily Palermo Tour
 * Gestisce la visualizzazione mensile, giorni disponibili, e slot orari per la prenotazione.
 */

class TourCalendar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container Calendario "${containerId}" non trovato.`);
            return;
        }

        this.onDateChange = options.onDateChange || null;
        this.onSlotChange = options.onSlotChange || null;

        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.selectedSlot = null;

        // Configurazione orari di default per tour
        this.defaultSlots = options.defaultSlots || [
            { time: '09:30', maxCapacity: 15, booked: 3 },
            { time: '11:30', maxCapacity: 15, booked: 12 },
            { time: '15:30', maxCapacity: 15, booked: 15 }, // Esaurito
            { time: '18:00', maxCapacity: 15, booked: 0 }
        ];

        // Giorni della settimana abbreviati
        this.weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        this.monthNames = [
            'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
        ];

        this.init();
    }

    init() {
        this.render();
    }

    render() {
        if (!this.container) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Calcola primo giorno e totale giorni del mese
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Adatta per iniziare da Lunedì (0 = Lunedì, 6 = Domenica)
        let startingDay = firstDayOfMonth.getDay() - 1;
        if (startingDay === -1) startingDay = 6;

        const totalDays = lastDayOfMonth.getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let html = `
            <div class="custom-calendar-widget">
                <!-- Header Mese e Navigazione -->
                <div class="calendar-header">
                    <button type="button" class="calendar-nav-btn" id="cal-prev-btn" title="Mese precedente">❮</button>
                    <h4>${this.monthNames[month]} ${year}</h4>
                    <button type="button" class="calendar-nav-btn" id="cal-next-btn" title="Mese successivo">❯</button>
                </div>

                <!-- Giorni Settimana -->
                <div class="calendar-weekdays">
                    ${this.weekDays.map(day => `<div>${day}</div>`).join('')}
                </div>

                <!-- Griglia Giorni Mese -->
                <div class="calendar-days-grid">
        `;

        // Canti vuoti prima del primo giorno del mese
        for (let i = 0; i < startingDay; i++) {
            html += `<div class="day-cell empty-cell"></div>`;
        }

        // Genera i giorni del mese
        for (let day = 1; day <= totalDays; day++) {
            const dateObj = new Date(year, month, day);
            dateObj.setHours(0, 0, 0, 0);

            const isToday = dateObj.getTime() === today.getTime();
            const isPast = dateObj.getTime() < today.getTime();
            const isSelected = this.selectedDate && dateObj.getTime() === this.selectedDate.getTime();

            let classes = ['day-cell'];
            if (isPast) classes.push('day-disabled');
            if (isToday) classes.push('day-today');
            if (isSelected) classes.push('day-selected');

            const dateStr = this.formatDateISO(dateObj);

            html += `
                <div class="${classes.join(' ')}"
                     data-date="${dateStr}"
                     ${isPast ? '' : `onclick="window.tourCalendarInstance.selectDate('${dateStr}')"`}>
                    <span>${day}</span>
                    ${!isPast ? '<span class="day-dot-available"></span>' : ''}
                </div>
            `;
        }

        html += `
                </div>

                <!-- Sezione Slot Orari per la Data Selezionata -->
                <div class="slots-container">
                    <div class="slots-title">
                        ⏰ Orari Disponibili per <span id="cal-selected-date-str">${this.formatDateReadable(this.selectedDate)}</span>:
                    </div>
                    <div class="slots-grid" id="cal-slots-grid">
                        ${this.renderSlotsHtml()}
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // Binda eventi bottoni mese
        const prevBtn = this.container.querySelector('#cal-prev-btn');
        const nextBtn = this.container.querySelector('#cal-next-btn');

        if (prevBtn) {
            // Disabilita navigazione a mesi passati rispetto ad oggi
            const prevMonthDate = new Date(year, month - 1, 1);
            if (prevMonthDate.getFullYear() < today.getFullYear() ||
               (prevMonthDate.getFullYear() === today.getFullYear() && prevMonthDate.getMonth() < today.getMonth())) {
                prevBtn.disabled = true;
            } else {
                prevBtn.onclick = () => this.changeMonth(-1);
            }
        }

        if (nextBtn) {
            nextBtn.onclick = () => this.changeMonth(1);
        }

        // Salva istanza globale per onclick inline
        window.tourCalendarInstance = this;
    }

    renderSlotsHtml() {
        return this.defaultSlots.map(slot => {
            const postiRimanenti = slot.maxCapacity - slot.booked;
            const isFull = postiRimanenti <= 0;
            const isSelected = this.selectedSlot === slot.time;

            let slotClasses = ['slot-card'];
            if (isFull) slotClasses.push('slot-full');
            if (isSelected) slotClasses.push('selected');

            return `
                <div class="${slotClasses.join(' ')}"
                     ${isFull ? '' : `onclick="window.tourCalendarInstance.selectSlot('${slot.time}')"`}>
                    <div class="slot-time">${slot.time}</div>
                    <div class="slot-status">
                        ${isFull ? '🔴 Esaurito' : `🟢 ${postiRimanenti} posti liberi`}
                    </div>
                </div>
            `;
        }).join('');
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
    }

    selectDate(dateStr) {
        const parts = dateStr.split('-');
        this.selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        this.selectedDate.setHours(0, 0, 0, 0);

        // Seleziona di default il primo slot disponibile
        const primoLibero = this.defaultSlots.find(s => (s.maxCapacity - s.booked) > 0);
        this.selectedSlot = primoLibero ? primoLibero.time : null;

        this.render();

        if (typeof this.onDateChange === 'function') {
            this.onDateChange(this.formatDateISO(this.selectedDate), this.selectedDate);
        }
    }

    selectSlot(time) {
        this.selectedSlot = time;

        // Aggiorna la vista slot
        const slotsGrid = this.container.querySelector('#cal-slots-grid');
        if (slotsGrid) {
            slotsGrid.innerHTML = this.renderSlotsHtml();
        }

        if (typeof this.onSlotChange === 'function') {
            this.onSlotChange(time);
        }
    }

    formatDateISO(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    formatDateReadable(dateObj) {
        if (!dateObj) return 'Nessuna data';
        const d = dateObj.getDate();
        const m = this.monthNames[dateObj.getMonth()];
        const y = dateObj.getFullYear();
        return `${d} ${m} ${y}`;
    }

    getSelectedData() {
        return {
            dateISO: this.formatDateISO(this.selectedDate),
            dateReadable: this.formatDateReadable(this.selectedDate),
            slotTime: this.selectedSlot || '09:30'
        };
    }
}
