// We halen Luxon op uit het globale object (omdat we de CDN gebruiken)
const { DateTime, Interval } = luxon;

// Elementen selecteren
const startInput = document.getElementById('startTime');
const endInput = document.getElementById('endTime');
const priceDisplay = document.getElementById('totalPrice');
const hoursDisplay = document.getElementById('totalHours');
const minMsg = document.getElementById('min-msg');

// Formatter voor euro's
const euroFormatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
});

function calculatePrice() {
    // 1. Datum van vandaag ophalen
    const today = DateTime.now().toISODate();
    
    // 2. Start- en eindtijd maken op basis van invoer
    let start = DateTime.fromISO(`${today}T${startInput.value}`);
    let end = DateTime.fromISO(`${today}T${endInput.value}`);

    // Als inputs leeg of ongeldig zijn, stoppen
    if (!start.isValid || !end.isValid) return;

    // 3. Als eindtijd kleiner is dan starttijd (bijv 02:00 vs 19:00), is het de volgende dag
    if (end < start) {
        end = end.plus({ days: 1 });
    }

    // 4. Middernacht bepalen (grens voor nachttarief)
    // We nemen de start van de dag van 'start' en tellen er 1 dag bij op (= 00:00 vannacht)
    const midnight = start.startOf('day').plus({ days: 1 });

    let normalMinutes = 0;
    let lateMinutes = 0;

    // 5. Minuten verdelen
    if (end > midnight) {
        // Sessie gaat over middernacht heen
        // Tijd van start tot middernacht
        normalMinutes = Interval.fromDateTimes(start, midnight).length('minutes');
        // Tijd van middernacht tot einde
        lateMinutes = Interval.fromDateTimes(midnight, end).length('minutes');
    } else {
        // Alles is voor middernacht
        normalMinutes = Interval.fromDateTimes(start, end).length('minutes');
    }

    // 6. Kosten berekenen
    // €11/uur = 11/60 per minuut
    // €12/uur = 12/60 per minuut
    let cost = (normalMinutes * (11 / 60)) + (lateMinutes * (12 / 60));

    // Minimum check
    if (cost < 22) {
        cost = 22;
        minMsg.style.display = 'block';
    } else {
        minMsg.style.display = 'none';
    }

    // 7. Tekst updaten op het scherm
    priceDisplay.innerText = euroFormatter.format(cost);

    // Totale duur berekenen voor weergave
    const diff = end.diff(start, ['hours', 'minutes']).toObject();
    hoursDisplay.innerText = `${diff.hours}u ${Math.round(diff.minutes)}m`;
}

// Luister naar wijzigingen in de inputvelden
startInput.addEventListener('input', calculatePrice);
endInput.addEventListener('input', calculatePrice);

// Start de berekening direct 1 keer bij het laden
calculatePrice();