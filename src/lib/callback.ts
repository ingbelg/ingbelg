/* Terugbel-deadline voor nieuwe aanvragen: de eerstvolgende werkdag (ma–vr, Brusselse tijd) na het moment van de aanvraag.
   Feestdagen worden niet meegerekend. Faalt nooit: bij een fout komt er gewoon geen regel in het bericht. */
const TZ = 'Europe/Brussels';

export function callbackDeadline(now: Date = new Date()): string {
  try {
    const weekday = (d: Date) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(d);
    let d = new Date(now.getTime());
    for (let i = 0; i < 7; i++) {
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      const wd = weekday(d);
      if (wd !== 'Sat' && wd !== 'Sun') break;
    }
    return new Intl.DateTimeFormat('nl-BE', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  } catch {
    return '';
  }
}
