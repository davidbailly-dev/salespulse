// Double de `next/navigation` pour les tests de hooks : hors du routeur de Next, le vrai
// `useSearchParams` n'a pas d'URL à lire. Chaque fichier de test le branche par
// `vi.mock('next/navigation', () => import('<chemin>/testing/nextNavigation'))`
// puis choisit l'URL avec `setSearchParams`.

let currentSearchParams = new URLSearchParams();

/** Query string lue par les hooks au prochain rendu, par exemple `'preset=7d&shop=shop-a'`. */
export function setSearchParams(query: string): void {
    currentSearchParams = new URLSearchParams(query);
}

export function useSearchParams(): URLSearchParams {
    return currentSearchParams;
}
