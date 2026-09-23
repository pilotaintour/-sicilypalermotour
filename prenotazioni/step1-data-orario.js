/**
 * STEP 1: Seleziona Data & Orario della Visita
 */

class Step1DataOrario {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onComplete = options.onComplete || null;
        this.tourData = options.tourData || null;

        this.calendarInstance = null;
        this.selectedDateISO = '';
        this.selectedDateReadable = '';
        this.selectedSlot = '';

        this.init();
    }

    init() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="step-card-header">
                📅 Step 1: Seleziona Data & Orario della Visita
            </div>

            <div id="step1-calendar-app">
                <!-- Modulo Calendario -->
            </div>

            <div class="step-nav-bar">
                <div></div>
                <button type="button" class="btn-nav-next" id="btn-step1-next">
                    Avanti: Partecipanti →
                </button>
            </div>
        `;

        // Prepara orari impostati dall'Admin per questo tour
        const customSlots = (this.tourData && this.tourData.timeSlots && this.tourData.timeSlots.length > 0)
            ? this.tourData.timeSlots.map(item => {
                if (typeof item === 'string') {
                    return { time: item, maxCapacity: this.tourData.maxCapacity || 15, booked: 0 };
                }
                if (item && typeof item === 'object' && item.time) {
                    return { time: item.time, maxCapacity: parseInt(item.capacity, 10) || 15, booked: 0 };
                }
                return null;
            }).filter(Boolean)
            : null;

        // Inizializza il Calendario
        this.calendarInstance = new TourCalendar('step1-calendar-app', {
            defaultSlots: customSlots || undefined,
            onDateChange: (isoStr, dateObj) => {
                this.selectedDateISO = isoStr;
                this.selectedDateReadable = this.calendarInstance ? this.calendarInstance.formatDateReadable(dateObj) : isoStr;
                if (this.calendarInstance && this.calendarInstance.selectedSlot) {
                    this.selectedSlot = this.calendarInstance.selectedSlot;
                }
            },
            onSlotChange: (time) => {
                this.selectedSlot = time;
            }
        });

        if (this.calendarInstance) {
            const initData = this.calendarInstance.getSelectedData();
            this.selectedDateISO = initData.dateISO;
            this.selectedDateReadable = initData.dateReadable;
            this.selectedSlot = initData.slotTime;
        }

        // Binda bottone Avanti
        const nextBtn = this.container.querySelector('#btn-step1-next');
        if (nextBtn) {
            nextBtn.onclick = () => this.validaEProsegui();
        }
    }

    validaEProsegui() {
        if (!this.selectedDateISO) {
            alert('Per favore seleziona una data sul calendario.');
            return;
        }
        if (!this.selectedSlot) {
            alert('Per favore seleziona un orario di partenza disponibile.');
            return;
        }

        if (typeof this.onComplete === 'function') {
            this.onComplete({
                dateISO: this.selectedDateISO,
                dateReadable: this.selectedDateReadable,
                slotTime: this.selectedSlot,
                calendarInstance: this.calendarInstance
            });
        }
    }

    getData() {
        return {
            dateISO: this.selectedDateISO,
            dateReadable: this.selectedDateReadable,
            slotTime: this.selectedSlot
        };
    }
}
