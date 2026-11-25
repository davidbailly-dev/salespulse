import { DomainError } from './domainError';

declare const ianaTimezoneBrand: unique symbol;

// Fuseau horaire de la base IANA (`Europe/Paris`, `UTC`…), reconnu par Intl (jalon 010, D12 et
// D34). Le nom reçu est gardé tel quel : Intl le remplacerait par son nom canonique, qui dépend
// de la version d'ICU (`Asia/Kolkata` devient `Asia/Calcutta` sous ICU 78.3).
export type IanaTimezone = string & { readonly [ianaTimezoneBrand]: true };

// Décalage fixe (`+01:00`) : Intl l'accepte, mais il ignore les changements d'heure.
const FIXED_OFFSET = /^[+-]/;

export function ianaTimezone(value: string): IanaTimezone {
    if (FIXED_OFFSET.test(value) || !isKnownByIntl(value)) {
        throw new DomainError('invalid-timezone', `Fuseau horaire IANA inconnu : « ${value} ».`);
    }
    return value as IanaTimezone;
}

function isKnownByIntl(value: string): boolean {
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: value });
        return true;
    } catch {
        return false;
    }
}
