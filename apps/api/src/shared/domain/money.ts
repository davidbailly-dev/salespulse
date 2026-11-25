import { CurrencyCode, currencyCode } from './currencyCode';
import { DomainError } from './domainError';

declare const moneyBrand: unique symbol;

// Montant entier en unités mineures (centimes pour l'euro) avec sa devise (jalon 010, D33).
// Un montant négatif est admis : interdire le négatif sur une composante relève de l'entity.
export type Money = Readonly<{ amount: number; currency: CurrencyCode }> & {
    readonly [moneyBrand]: true;
};

export function money(amount: number, currency: string): Money {
    if (!Number.isSafeInteger(amount)) {
        throw new DomainError(
            'invalid-money',
            `Montant invalide : ${amount} (entier en unités mineures attendu).`,
        );
    }
    // `+ 0` ramène -0 à 0, que Number.isSafeInteger accepte et que Object.is distingue de 0.
    return { amount: amount + 0, currency: currencyCode(currency) } as Money;
}

export function addMoney(left: Money, right: Money): Money {
    assertSameCurrency(left, right);
    return money(left.amount + right.amount, left.currency);
}

export function subtractMoney(left: Money, right: Money): Money {
    assertSameCurrency(left, right);
    return money(left.amount - right.amount, left.currency);
}

function assertSameCurrency(left: Money, right: Money): void {
    if (left.currency !== right.currency) {
        throw new DomainError(
            'currency-mismatch',
            `Devises différentes : ${left.currency} et ${right.currency}.`,
        );
    }
}
