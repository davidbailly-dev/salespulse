/**
 * Même instant, un an calendaire plus tôt (et non 365 jours : le décalage vaut 366 jours en
 * enjambant un 29 février). Le 29 février lui-même retombe au 1er mars, comportement natif de
 * `Date`. Sert à la fois au mock (fenêtre N-1) et à la plage de comparaison des filtres, pour que
 * les deux restent alignés.
 */
export function subtractOneYear(date: Date): Date {
    const shifted = new Date(date);
    shifted.setUTCFullYear(shifted.getUTCFullYear() - 1);

    return shifted;
}
