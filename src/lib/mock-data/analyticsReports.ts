import type { AdSpendRow, PageStat, PageViewRow, SearchRow, SearchTermStat, TrafficRow, WebVitalsRow } from './schemas';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type ReportParams = {
    from?: string | null;
    to?: string | null;
    shop?: string | null;
};

/**
 * Poids (0 à 1) d'une ligne quotidienne dans la plage demandée, 0 = ligne exclue.
 *
 * Les lignes sont au jour (début de journée UTC) alors que `from`/`to` sont des instants. Un
 * jour qui commence avant `from` n'est retenu que pour la part de journée située dans la plage
 * (`from` = 25/09 14h30 -> 42 % du 25/09), sinon "7 jours" couvrirait 8 jours de trafic face à
 * des commandes filtrées à l'instant près, et fausserait conversion et revenu par visite.
 *
 * Côté `to`, le jour qui le contient est retenu entier : avec la plage glissante `to` = maintenant
 * et la ligne du jour courant ne couvre déjà que la part écoulée de la journée (voir
 * `buildDayShares` dans analyticsGenerator.ts), un second prorata la compterait deux fois.
 */
function createDayWeight({ from, to, shop }: ReportParams) {
    const fromTime = from ? new Date(from).getTime() : null;
    const toTime = to ? new Date(to).getTime() : null;

    return (row: { date: string; shopId: string }): number => {
        if (shop && row.shopId !== shop) return 0;

        const dayStart = new Date(row.date).getTime();
        if (toTime !== null && dayStart > toTime) return 0;
        if (fromTime === null || fromTime <= dayStart) return 1;

        return Math.min(Math.max((dayStart + MS_PER_DAY - fromTime) / MS_PER_DAY, 0), 1);
    };
}

// Arrondi après prorata : ne casse pas les inégalités entre champs (engagedSessions <= sessions...),
// car multiplier deux entiers a <= b par le même poids puis arrondir conserve a' <= b'.
function scaleCount(value: number, weight: number): number {
    return weight === 1 ? value : Math.round(value * weight);
}

export function filterTraffic(rows: TrafficRow[], params: ReportParams): TrafficRow[] {
    const getWeight = createDayWeight(params);

    return rows.flatMap((row) => {
        const weight = getWeight(row);
        if (weight === 0) return [];
        if (weight === 1) return [row];

        return [
            {
                ...row,
                sessions: scaleCount(row.sessions, weight),
                users: scaleCount(row.users, weight),
                newUsers: scaleCount(row.newUsers, weight),
                engagedSessions: scaleCount(row.engagedSessions, weight),
                deepScrollSessions: scaleCount(row.deepScrollSessions, weight),
                totalSessionDurationSeconds: scaleCount(row.totalSessionDurationSeconds, weight),
                pageViews: scaleCount(row.pageViews, weight),
            },
        ];
    });
}

/**
 * Pages agrégées sur la plage demandée (une ligne par page, toutes boutiques confondues si
 * `shop` est absent), triées par vues décroissantes. C'est l'équivalent d'un rapport "pages
 * et écrans" GA4 : l'agrégation est faite côté serveur, pas dans le navigateur.
 */
export function buildPageStats(rows: PageViewRow[], params: ReportParams): PageStat[] {
    const getWeight = createDayWeight(params);
    const statsByPath = new Map<string, PageStat>();

    rows.forEach(({ path, title, type, productId, views, exits, ...row }) => {
        const weight = getWeight({ date: row.date, shopId: row.shopId });
        const weightedViews = scaleCount(views, weight);
        if (weightedViews <= 0) return;

        const stat = statsByPath.get(path);
        if (stat) {
            stat.views += weightedViews;
            stat.exits += scaleCount(exits, weight);
        } else {
            statsByPath.set(path, { path, title, type, productId, views: weightedViews, exits: scaleCount(exits, weight) });
        }
    });

    return [...statsByPath.values()].sort((a, b) => b.views - a.views);
}

/** Termes de recherche interne agrégés sur la plage demandée, triés par volume décroissant. */
export function buildSearchTermStats(rows: SearchRow[], params: ReportParams): SearchTermStat[] {
    const getWeight = createDayWeight(params);
    const statsByTerm = new Map<string, SearchTermStat>();

    rows.forEach((row) => {
        const weightedSearches = scaleCount(row.searches, getWeight(row));
        if (weightedSearches <= 0) return;

        const stat = statsByTerm.get(row.term);
        if (stat) {
            stat.searches += weightedSearches;
        } else {
            statsByTerm.set(row.term, { term: row.term, hasResults: row.hasResults, searches: weightedSearches });
        }
    });

    return [...statsByTerm.values()].sort((a, b) => b.searches - a.searches);
}

/**
 * Dépenses publicitaires de la plage demandée. Même prorata de jours que `filterTraffic`, pour
 * que dépenses et sessions couvrent la même durée (CPV, ROAS, CAC).
 */
export function filterAdSpend(rows: AdSpendRow[], params: ReportParams): AdSpendRow[] {
    const getWeight = createDayWeight(params);

    return rows.flatMap((row) => {
        const weight = getWeight(row);
        if (weight === 0) return [];
        if (weight === 1) return [row];

        return [
            {
                ...row,
                spend: Math.round(row.spend * weight * 100) / 100,
                clicks: scaleCount(row.clicks, weight),
            },
        ];
    });
}

/**
 * Core Web Vitals de la plage demandée. Le prorata ne touche que `samples` (le poids des lignes) :
 * les valeurs mesurées, elles, ne dépendent pas de la part de journée couverte.
 */
export function filterWebVitals(rows: WebVitalsRow[], params: ReportParams): WebVitalsRow[] {
    const getWeight = createDayWeight(params);

    return rows.flatMap((row) => {
        const weight = getWeight(row);
        if (weight === 0) return [];
        if (weight === 1) return [row];

        return [{ ...row, samples: scaleCount(row.samples, weight) }];
    });
}
