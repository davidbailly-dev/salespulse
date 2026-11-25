// Erreur levée quand une valeur viole un invariant du domaine (jalon 010, D32). Le code est
// stable et sert aux journaux ; le message est destiné à un humain.
export class DomainError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = 'DomainError';
        this.code = code;
    }
}
