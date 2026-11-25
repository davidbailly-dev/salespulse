import { DomainError } from '../shared/domain/domainError';

// Code de la DomainError levée par `action`, `undefined` si rien n'est levé, et
// `not-a-domain-error` pour toute autre erreur : une assertion sur le code couvre les trois cas.
// Synchrone seulement : le rejet d'une action async lui échapperait et se lirait « rien n'est levé ».
export function errorCodeOf(action: () => unknown): string | undefined {
    let result: unknown;
    try {
        result = action();
    } catch (error) {
        return error instanceof DomainError ? error.code : 'not-a-domain-error';
    }
    if (result instanceof Promise) {
        throw new TypeError('errorCodeOf ne prend pas d’action async : utiliser `rejects`.');
    }
    return undefined;
}
