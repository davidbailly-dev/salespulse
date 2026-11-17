/**
 * Même instant, un an calendaire plus tôt (et non 365 jours : le décalage vaut 366 jours en
 * enjambant un 29 février). Le 29 février lui-même recule au 28 février, à la même heure (et non
 * au 1er mars comme le ferait `Date` nativement), pour que la période N-1 de "février" ne déborde
 * pas sur mars. Sert à la fois au mock (fenêtre N-1) et à la plage de comparaison des filtres,
 * pour que les deux restent alignés.
 */
export function subtractOneYear(date: Date): Date {
    const shifted = new Date(date);
    shifted.setUTCFullYear(shifted.getUTCFullYear() - 1);

    // Le 29 février a débordé au 1er mars : jour 0 du mois = dernier jour du mois précédent.
    if (shifted.getUTCMonth() !== date.getUTCMonth()) shifted.setUTCDate(0);

    return shifted;
}
