import { DomainError } from './domainError';
import { ISO_4217_MINOR_UNITS } from './iso4217';

declare const currencyCodeBrand: unique symbol;

// Code de devise de la liste ISO 4217. Toute devise est acceptée ici : la restriction à l'euro
// est une règle de la boutique (jalon 007, D11 et D17).
export type CurrencyCode = string & { readonly [currencyCodeBrand]: true };

export function currencyCode(value: string): CurrencyCode {
    if (!ISO_4217_MINOR_UNITS.has(value)) {
        throw new DomainError('invalid-currency', `Code de devise ISO 4217 inconnu : « ${value} ».`);
    }
    return value as CurrencyCode;
}

// Nombre de décimales des unités mineures : 2 pour l'euro, 0 pour le yen, 3 pour le dinar koweïtien.
export function currencyDecimals(currency: CurrencyCode): number {
    const decimals = ISO_4217_MINOR_UNITS.get(currency);
    if (decimals === undefined) {
        // Inatteignable pour une CurrencyCode construite par currencyCode().
        throw new DomainError('invalid-currency', `Devise sans unités mineures : « ${currency} ».`);
    }
    return decimals;
}
