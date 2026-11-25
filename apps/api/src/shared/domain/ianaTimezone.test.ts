import { describe, expect, it } from 'vitest';

import { errorCodeOf } from '../../testing/errorCodeOf';
import { ianaTimezone } from './ianaTimezone';

describe('ianaTimezone', () => {
    it.each(['Europe/Paris', 'UTC', 'America/Santiago', 'Etc/GMT+1'])('accepte « %s »', (value) => {
        expect(ianaTimezone(value)).toBe(value);
    });

    it('garde le nom reçu, sans le remplacer par le nom canonique d’Intl', () => {
        // Sous ICU 78.3, Intl renvoie Asia/Calcutta pour Asia/Kolkata.
        expect(ianaTimezone('Asia/Kolkata')).toBe('Asia/Kolkata');
    });

    it.each([
        ['Paris', 'nom incomplet'],
        ['Europe/Nowhere', 'fuseau inconnu'],
        ['', 'chaîne vide'],
        ['+01:00', 'décalage fixe, accepté par Intl mais pas un fuseau IANA'],
        ['-05:00', 'décalage fixe négatif'],
    ])('refuse « %s » (%s)', (value) => {
        expect(errorCodeOf(() => ianaTimezone(value))).toBe('invalid-timezone');
    });
});
