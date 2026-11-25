import { DomainError } from './domainError';
import { IanaTimezone } from './ianaTimezone';

declare const localDayBrand: unique symbol;

// Jour calendaire local `AAAA-MM-JJ`, comparable dans l'ordre alphabétique (jalon 010, D34). Il
// n'a de bornes en instants que dans un fuseau, et dure 23 h ou 25 h aux changements d'heure (D12).
export type LocalDay = string & { readonly [localDayBrand]: true };

// Intervalle semi-ouvert [start, end[ : end est le début du lendemain.
export type LocalDayBounds = Readonly<{ start: Date; end: Date }>;

// Années de 1000 à 9999 : quatre chiffres, qui gardent l'ordre alphabétique (D49).
const MIN_YEAR = 1000;
const MAX_YEAR = 9999;
const LOCAL_DAY_FORMAT = /^(\d{4})-(\d{2})-(\d{2})$/;
const SECOND_MS = 1000;
const DAY_MS = 86_400_000;

export function localDay(value: string): LocalDay {
    const match = LOCAL_DAY_FORMAT.exec(value);
    if (match === null || !isCalendarDate(Number(match[1]), Number(match[2]), Number(match[3]))) {
        throw new DomainError(
            'invalid-local-day',
            `Jour local invalide : « ${value} » (AAAA-MM-JJ, années ${MIN_YEAR} à ${MAX_YEAR}).`,
        );
    }
    return value as LocalDay;
}

export function localDayOf(instant: Date, timezone: IanaTimezone): LocalDay {
    if (Number.isNaN(instant.getTime())) {
        throw new DomainError('invalid-instant', 'Instant invalide.');
    }
    const wallTime = wallClockTime(instant.getTime(), timezone);
    const year = new Date(wallTime).getUTCFullYear();
    if (year < MIN_YEAR || year > MAX_YEAR) {
        throw new DomainError(
            'invalid-instant',
            `Instant hors des années ${MIN_YEAR} à ${MAX_YEAR} dans le fuseau ${timezone} : ` +
                `${instant.toISOString()}.`,
        );
    }
    return localDay(new Date(wallTime).toISOString().slice(0, 10));
}

export function localDayBounds(day: LocalDay, timezone: IanaTimezone): LocalDayBounds {
    // Le lendemain se calcule en heure murale, sans construire son LocalDay : celui du
    // 9999-12-31 sortirait de la plage.
    const midnight = Date.parse(`${day}T00:00:00Z`);
    return {
        start: new Date(startOfLocalDay(midnight, timezone)),
        end: new Date(startOfLocalDay(midnight + DAY_MS, timezone)),
    };
}

function isCalendarDate(year: number, month: number, day: number): boolean {
    // Le jour 0 du mois suivant est le dernier jour du mois.
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return (
        year >= MIN_YEAR &&
        year <= MAX_YEAR &&
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= daysInMonth
    );
}

// Premier instant dont le jour local commence au minuit `midnight` (heure murale, voir
// wallClockTime). Minuit se cherche avec le décalage d'avant et celui d'après un éventuel
// changement d'heure ; quand minuit existe deux fois, le premier l'emporte. Quand minuit est
// sauté, aucun candidat ne tombe sur minuit et le jour commence au changement d'heure, compris
// entre les deux candidats, même quand le saut enjambe minuit (23:30 → 00:30).
// Suppose au plus un changement d'heure dans les 24 h qui entourent minuit.
// Limite : quand l'horloge recule par-dessus minuit (00:01 → 23:01, à St John's jusqu'en
// 2010), la veille reprend pendant une heure après ce début ; localDayOf donne alors la veille à
// des instants compris dans les bornes du jour (D49).
function startOfLocalDay(midnight: number, timezone: IanaTimezone): number {
    const candidates = [
        midnight - offsetAt(midnight - DAY_MS, timezone),
        midnight - offsetAt(midnight + DAY_MS, timezone),
    ];
    const atMidnight = candidates.filter((time) => wallClockTime(time, timezone) === midnight);
    if (atMidnight.length > 0) {
        return Math.min(...atMidnight);
    }
    const [low, high] = [Math.min(...candidates), Math.max(...candidates)];
    return firstInstantReaching(midnight, low, high, timezone);
}

// Premier instant de ]low, high], à la seconde, dont l'heure murale atteint `wallTime`, cherché
// par dichotomie : l'heure murale y croît, l'horloge n'y faisant qu'un saut vers l'avant.
function firstInstantReaching(
    wallTime: number,
    low: number,
    high: number,
    timezone: IanaTimezone,
): number {
    while (high - low > SECOND_MS) {
        const middle = low + Math.floor((high - low) / (2 * SECOND_MS)) * SECOND_MS;
        if (wallClockTime(middle, timezone) >= wallTime) {
            high = middle;
        } else {
            low = middle;
        }
    }
    return high;
}

function offsetAt(time: number, timezone: IanaTimezone): number {
    return wallClockTime(time, timezone) - time;
}

// Heure murale de l'instant `time` dans le fuseau, représentée comme un instant UTC (minuit local
// du jour J s'écrit `Date.parse('JT00:00:00Z')`), à la seconde près : les décalages des fuseaux
// sont des secondes entières, les millisecondes ne changent donc ni le jour ni ses bornes.
// setUTCFullYear, contrairement à Date.UTC, ne lit pas les années 0 à 99 comme 1900 à 1999.
function wallClockTime(time: number, timezone: IanaTimezone): number {
    const parts = formatterFor(timezone).formatToParts(time);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
        Number(parts.find((candidate) => candidate.type === type)?.value);
    const wallTime = new Date(0);
    wallTime.setUTCFullYear(part('year'), part('month') - 1, part('day'));
    wallTime.setUTCHours(part('hour'), part('minute'), part('second'));
    return wallTime.getTime();
}

// Un formateur par fuseau, construit une fois : la synchronisation calcule le jour local de
// chaque commande (D38).
const formatters = new Map<IanaTimezone, Intl.DateTimeFormat>();

function formatterFor(timezone: IanaTimezone): Intl.DateTimeFormat {
    let formatter = formatters.get(timezone);
    if (formatter === undefined) {
        formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hourCycle: 'h23',
        });
        formatters.set(timezone, formatter);
    }
    return formatter;
}
