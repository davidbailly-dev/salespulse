import { ErrorRow, TrafficRow } from '@salespulse/contracts';

/** Taux de 404 : Σ erreurs `not_found` / Σ pages vues, en % avec 2 décimales. */
export function calculateNotFoundRate(errors: ErrorRow[], traffic: TrafficRow[]): number {
    const totalPageViews = traffic.reduce((total, row) => total + row.pageViews, 0);
    if (totalPageViews === 0) return 0;

    const notFoundCount = errors.filter((row) => row.type === 'not_found').reduce((total, row) => total + row.count, 0);

    return Math.round((notFoundCount / totalPageViews) * 10000) / 100;
}
