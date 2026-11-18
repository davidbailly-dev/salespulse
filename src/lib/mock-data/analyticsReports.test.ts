import { describe, expect, it } from 'vitest';
import {
    buildAdSpendRow,
    buildEmailRow,
    buildErrorRow,
    buildPageViewRow,
    buildSearchRow,
    buildTrafficRow,
    buildWebVitalsRow,
} from '../testing/builders';
import {
    buildPageStats,
    buildSearchTermStats,
    filterAdSpend,
    filterEmails,
    filterErrors,
    filterTraffic,
    filterWebVitals,
    type ReportParams,
} from './analyticsReports';

// Début de journée UTC du mois de janvier 2026, comme les lignes analytics stockées par le mock.
const day = (dayOfMonth: number): string => `2026-01-${String(dayOfMonth).padStart(2, '0')}T00:00:00.000Z`;

// Instants de `from` dans la journée du 15 janvier et part de journée qu'ils laissent dans la plage
// (la part de la journée restante après `from`, voir `createDayWeight`).
const FROM_NOON = '2026-01-15T12:00:00.000Z'; // 12 h restantes sur 24 -> poids 0,5
const FROM_18H = '2026-01-15T18:00:00.000Z'; // 6 h restantes sur 24 -> poids 0,25
const FROM_16H = '2026-01-15T16:00:00.000Z'; // 8 h restantes sur 24 -> poids 1/3

type DatedRow = { date: string; shopId: string };
type RangeFilterCase = [
    string,
    (rows: DatedRow[], params: ReportParams) => DatedRow[],
    (overrides?: Partial<DatedRow>) => DatedRow,
];

// Chaque filtre est typé sur sa propre ligne analytics : on les range dans un même tableau en les
// ramenant à `DatedRow`, seul sous-ensemble de champs que ces tests utilisent (le cast évite que le
// mode strict refuse un paramètre plus étroit que `DatedRow`).
function rangeFilterCase<Row extends DatedRow>(
    name: string,
    filter: (rows: Row[], params: ReportParams) => Row[],
    build: (overrides?: Partial<Row>) => Row,
): RangeFilterCase {
    return [name, filter as unknown as RangeFilterCase[1], build as unknown as RangeFilterCase[2]];
}

// Les cinq filtres de lignes quotidiennes s'appuient sur le même `createDayWeight` (non exporté) :
// on teste donc ses règles de plage une fois pour chacun d'eux.
const RANGE_FILTERS: RangeFilterCase[] = [
    rangeFilterCase('filterTraffic', filterTraffic, buildTrafficRow),
    rangeFilterCase('filterAdSpend', filterAdSpend, buildAdSpendRow),
    rangeFilterCase('filterWebVitals', filterWebVitals, buildWebVitalsRow),
    rangeFilterCase('filterErrors', filterErrors, buildErrorRow),
    rangeFilterCase('filterEmails', filterEmails, buildEmailRow),
];

describe.each(RANGE_FILTERS)('%s : règles de plage communes', (_name, filter, build) => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(filter([], { from: day(1), to: day(31) })).toEqual([]);
    });

    it('conserve toutes les lignes sans paramètre', () => {
        const rows = [build({ date: day(14) }), build({ date: day(15), shopId: 'autre-boutique' })];

        expect(filter(rows, {})).toEqual(rows);
    });

    it('traite des paramètres `null` comme absents', () => {
        const rows = [build({ date: day(14) }), build({ date: day(15), shopId: 'autre-boutique' })];

        expect(filter(rows, { from: null, to: null, shop: null })).toEqual(rows);
    });

    describe('filtre boutique', () => {
        it('ne garde que les lignes de la boutique demandée', () => {
            const mine = build({ shopId: 'boutique-a' });
            const other = build({ shopId: 'boutique-b' });

            expect(filter([mine, other], { shop: 'boutique-a' })).toEqual([mine]);
        });

        it('renvoie une liste vide quand aucune ligne ne correspond', () => {
            expect(filter([build({ shopId: 'boutique-a' })], { shop: 'inconnue' })).toEqual([]);
        });
    });

    describe('borne `to` (le jour qui la contient est conservé entier)', () => {
        it('exclut un jour qui commence après `to`', () => {
            const rows = [build({ date: day(15) }), build({ date: day(16) })];

            expect(filter(rows, { to: '2026-01-15T10:00:00.000Z' })).toEqual([rows[0]]);
        });

        it('conserve le jour de `to` sans prorata, même si `to` est en début de journée', () => {
            const row = build({ date: day(15) });

            expect(filter([row], { to: '2026-01-15T00:00:01.000Z' })).toEqual([row]);
        });

        // `to` à minuit pile : aucune commande de ce jour n'est dans la plage, son trafic non plus.
        it('exclut un jour qui commence pile à `to`', () => {
            const rows = [build({ date: day(15) }), build({ date: day(16) })];

            expect(filter(rows, { to: day(16) })).toEqual([rows[0]]);
        });

        it('exclut un jour qui commence une milliseconde après `to`', () => {
            const row = build({ date: day(16) });

            expect(filter([row], { to: '2026-01-15T23:59:59.999Z' })).toEqual([]);
        });
    });

    describe('borne `from`', () => {
        it('conserve entier un jour qui commence pile à `from`', () => {
            const row = build({ date: day(15) });

            expect(filter([row], { from: day(15) })).toEqual([row]);
        });

        it('exclut un jour qui se termine pile à `from` (poids nul)', () => {
            expect(filter([build({ date: day(14) })], { from: day(15) })).toEqual([]);
        });

        it('exclut un jour entièrement avant `from`', () => {
            expect(filter([build({ date: day(14) })], { from: FROM_NOON })).toEqual([]);
        });

        it('conserve entier un jour postérieur à celui de `from`', () => {
            const row = build({ date: day(16) });

            expect(filter([row], { from: FROM_NOON })).toEqual([row]);
        });

        it('conserve (au moins en partie) le jour qui contient `from`', () => {
            expect(filter([build({ date: day(15) })], { from: FROM_NOON })).toHaveLength(1);
        });
    });
});

describe('filterTraffic', () => {
    it('proratise tous les compteurs du jour qui contient `from`', () => {
        const row = buildTrafficRow({
            date: day(15),
            sessions: 100,
            users: 80,
            newUsers: 40,
            engagedSessions: 60,
            deepScrollSessions: 30,
            totalSessionDurationSeconds: 12000,
            pageViews: 300,
        });

        expect(filterTraffic([row], { from: FROM_NOON })).toEqual([
            {
                ...row,
                sessions: 50,
                users: 40,
                newUsers: 20,
                engagedSessions: 30,
                deepScrollSessions: 15,
                totalSessionDurationSeconds: 6000,
                pageViews: 150,
            },
        ]);
    });

    it('ne modifie ni la ligne d\'origine ni ses champs de dimension', () => {
        const row = buildTrafficRow({ date: day(15), channel: 'paid', device: 'mobile', sessions: 100 });

        const [result] = filterTraffic([row], { from: FROM_NOON });

        expect(row.sessions).toBe(100);
        expect(result).toMatchObject({ date: day(15), shopId: row.shopId, channel: 'paid', device: 'mobile' });
    });

    it('arrondit à l\'entier le plus proche après prorata (25,25 -> 25 ; 25,75 -> 26)', () => {
        const row = buildTrafficRow({ date: day(15), sessions: 103, pageViews: 101 });

        const [result] = filterTraffic([row], { from: FROM_18H });

        expect(result.sessions).toBe(26);
        expect(result.pageViews).toBe(25);
    });

    // Limite connue (voir `createDayWeight`) : le jour de `to` n'est jamais proratisé. Exact pour
    // `to` = maintenant ou fin de journée (seuls cas produits par l'UI), surcompte sinon : ici
    // 12 h de trafic (50 %) pour une plage de 8 h.
    it('ne proratise pas le côté `to`, même quand `from` et `to` sont dans la même journée (limite connue)', () => {
        const row = buildTrafficRow({ date: day(15), sessions: 100 });

        const result = filterTraffic([row], { from: FROM_NOON, to: '2026-01-15T20:00:00.000Z' });

        expect(result.map((r) => r.sessions)).toEqual([50]);
    });

    // "7 jours" glissants : `from` = 8 janvier 12 h, `to` = maintenant = 15 janvier 12 h.
    // Le 8 compte pour moitié, du 9 au 14 pour un jour entier, et le 15 (jour de `to`) en entier.
    it('couvre une plage glissante de 7 jours : 0,5 + 6 + 1 jours de trafic', () => {
        const rows = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((d) => buildTrafficRow({ date: day(d), sessions: 100 }));

        const result = filterTraffic(rows, { from: '2026-01-08T12:00:00.000Z', to: '2026-01-15T12:00:00.000Z' });

        expect(result.map((r) => r.date)).toEqual([8, 9, 10, 11, 12, 13, 14, 15].map(day));
        expect(result.reduce((acc, r) => acc + r.sessions, 0)).toBe(50 + 600 + 100);
    });

    // Les inégalités du schéma (engagées <= sessions, scroll profond <= engagées, nouveaux
    // utilisateurs <= utilisateurs) doivent survivre à l'arrondi, quel que soit le poids.
    it.each([FROM_NOON, FROM_18H, FROM_16H, '2026-01-15T05:17:00.000Z', '2026-01-15T22:41:00.000Z'])(
        'conserve les inégalités entre champs après arrondi (from = %s)',
        (from) => {
            const rows = Array.from({ length: 200 }, (_, i) => {
                const sessions = i * 7 + 1;
                const users = Math.floor(sessions * 0.8);
                const engagedSessions = Math.floor(sessions * 0.6);

                return buildTrafficRow({
                    date: day(15),
                    sessions,
                    users,
                    newUsers: Math.floor(users * 0.5),
                    engagedSessions,
                    deepScrollSessions: Math.floor(engagedSessions * 0.5),
                });
            });

            filterTraffic(rows, { from }).forEach((row) => {
                expect(row.engagedSessions).toBeLessThanOrEqual(row.sessions);
                expect(row.deepScrollSessions).toBeLessThanOrEqual(row.engagedSessions);
                expect(row.newUsers).toBeLessThanOrEqual(row.users);
                expect(row.users).toBeLessThanOrEqual(row.sessions);
            });
        },
    );
});

describe('filterAdSpend', () => {
    it('proratise les dépenses et les clics', () => {
        const row = buildAdSpendRow({ date: day(15), spend: 50, clicks: 100 });

        expect(filterAdSpend([row], { from: FROM_NOON })).toEqual([{ ...row, spend: 25, clicks: 50 }]);
    });

    it('arrondit les dépenses au centime (8,3325 -> 8,33)', () => {
        const row = buildAdSpendRow({ date: day(15), spend: 33.33 });

        expect(filterAdSpend([row], { from: FROM_18H })[0].spend).toBe(8.33);
    });

    it('arrondit les dépenses au centime (16,666… -> 16,67)', () => {
        const row = buildAdSpendRow({ date: day(15), spend: 50 });

        expect(filterAdSpend([row], { from: FROM_16H })[0].spend).toBe(16.67);
    });

    it('arrondit les clics à l\'entier', () => {
        const row = buildAdSpendRow({ date: day(15), clicks: 101 });

        expect(filterAdSpend([row], { from: FROM_18H })[0].clicks).toBe(25);
    });

    it('conserve le canal et la boutique', () => {
        const row = buildAdSpendRow({ date: day(15), channel: 'social', shopId: 'boutique-a' });

        expect(filterAdSpend([row], { from: FROM_NOON })[0]).toMatchObject({ channel: 'social', shopId: 'boutique-a' });
    });
});

describe('filterWebVitals', () => {
    it('ne proratise que `samples` et laisse les valeurs mesurées intactes', () => {
        const row = buildWebVitalsRow({
            date: day(15),
            samples: 100,
            lcpMs: 2000,
            inpMs: 150,
            cls: 0.05,
            loadTimeMs: 1500,
        });

        expect(filterWebVitals([row], { from: FROM_NOON })).toEqual([{ ...row, samples: 50 }]);
    });

    it('conserve la ligne même si `samples` arrondi tombe à zéro', () => {
        const row = buildWebVitalsRow({ date: day(15), samples: 1 });

        expect(filterWebVitals([row], { from: FROM_18H })).toEqual([{ ...row, samples: 0 }]);
    });
});

describe('filterErrors', () => {
    it('proratise le compteur (2,5 -> 3)', () => {
        const row = buildErrorRow({ date: day(15), count: 5 });

        expect(filterErrors([row], { from: FROM_NOON })).toEqual([{ ...row, count: 3 }]);
    });

    it('supprime la ligne quand le compteur arrondi tombe à zéro (le schéma impose count > 0)', () => {
        const row = buildErrorRow({ date: day(15), count: 1 });

        expect(filterErrors([row], { from: FROM_18H })).toEqual([]);
    });

    it('conserve la ligne quand le compteur arrondi vaut 1 (0,5 -> 1)', () => {
        const row = buildErrorRow({ date: day(15), count: 2 });

        expect(filterErrors([row], { from: FROM_18H })).toEqual([{ ...row, count: 1 }]);
    });

    it('conserve le type d\'erreur', () => {
        const row = buildErrorRow({ date: day(15), type: 'payment_failed', count: 10 });

        expect(filterErrors([row], { from: FROM_NOON })[0].type).toBe('payment_failed');
    });
});

describe('filterEmails', () => {
    it('proratise les envois, ouvertures et clics', () => {
        const row = buildEmailRow({ date: day(15), sent: 1000, opens: 300, clicks: 50 });

        expect(filterEmails([row], { from: FROM_NOON })).toEqual([{ ...row, sent: 500, opens: 150, clicks: 25 }]);
    });

    it.each([FROM_NOON, FROM_18H, FROM_16H, '2026-01-15T05:17:00.000Z'])(
        'conserve clics <= ouvertures <= envois après arrondi (from = %s)',
        (from) => {
            const rows = Array.from({ length: 200 }, (_, i) => {
                const sent = i * 13 + 1;
                const opens = Math.floor(sent * 0.4);

                return buildEmailRow({ date: day(15), sent, opens, clicks: Math.floor(opens * 0.25) });
            });

            filterEmails(rows, { from }).forEach((row) => {
                expect(row.clicks).toBeLessThanOrEqual(row.opens);
                expect(row.opens).toBeLessThanOrEqual(row.sent);
            });
        },
    );
});

describe('buildPageStats', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(buildPageStats([], {})).toEqual([]);
    });

    it('agrège les vues et sorties par page, sur plusieurs jours et plusieurs boutiques', () => {
        const rows = [
            buildPageViewRow({ date: day(14), shopId: 'boutique-a', path: '/a', views: 100, exits: 10 }),
            buildPageViewRow({ date: day(15), shopId: 'boutique-b', path: '/a', views: 50, exits: 5 }),
            buildPageViewRow({ date: day(14), shopId: 'boutique-a', path: '/b', views: 300, exits: 30 }),
        ];

        const result = buildPageStats(rows, {});

        expect(result.map(({ path, views, exits }) => ({ path, views, exits }))).toEqual([
            { path: '/b', views: 300, exits: 30 },
            { path: '/a', views: 150, exits: 15 },
        ]);
    });

    it('trie par vues décroissantes', () => {
        const rows = [
            buildPageViewRow({ path: '/petite', views: 10 }),
            buildPageViewRow({ path: '/grande', views: 500 }),
            buildPageViewRow({ path: '/moyenne', views: 100 }),
        ];

        expect(buildPageStats(rows, {}).map((stat) => stat.path)).toEqual(['/grande', '/moyenne', '/petite']);
    });

    it('expose les champs d\'une page sans la date ni la boutique', () => {
        const row = buildPageViewRow({
            path: '/produits/epee',
            title: 'Épée',
            type: 'product',
            productId: 'product-9',
            views: 100,
            exits: 20,
        });

        expect(buildPageStats([row], {})).toEqual([
            { path: '/produits/epee', title: 'Épée', type: 'product', productId: 'product-9', views: 100, exits: 20 },
        ]);
    });

    it('conserve le titre de la première ligne rencontrée pour une page', () => {
        const rows = [
            buildPageViewRow({ date: day(14), path: '/a', title: 'Ancien titre' }),
            buildPageViewRow({ date: day(15), path: '/a', title: 'Nouveau titre' }),
        ];

        expect(buildPageStats(rows, {})[0].title).toBe('Ancien titre');
    });

    it('ne modifie pas les lignes d\'origine en agrégeant', () => {
        const rows = [
            buildPageViewRow({ date: day(14), path: '/a', views: 100, exits: 10 }),
            buildPageViewRow({ date: day(15), path: '/a', views: 50, exits: 5 }),
        ];

        buildPageStats(rows, {});

        expect(rows.map((row) => row.views)).toEqual([100, 50]);
        expect(rows.map((row) => row.exits)).toEqual([10, 5]);
    });

    it('ne garde que la boutique demandée', () => {
        const rows = [
            buildPageViewRow({ shopId: 'boutique-a', path: '/a', views: 100 }),
            buildPageViewRow({ shopId: 'boutique-b', path: '/b', views: 999 }),
        ];

        expect(buildPageStats(rows, { shop: 'boutique-a' }).map((stat) => stat.path)).toEqual(['/a']);
    });

    it('exclut les jours hors plage', () => {
        const rows = [
            buildPageViewRow({ date: day(14), path: '/a', views: 100 }),
            buildPageViewRow({ date: day(16), path: '/a', views: 100 }),
        ];

        expect(buildPageStats(rows, { from: day(15), to: '2026-01-15T10:00:00.000Z' })).toEqual([]);
    });

    it('proratise les vues et les sorties du jour qui contient `from`', () => {
        const row = buildPageViewRow({ date: day(15), path: '/a', views: 100, exits: 20 });

        const [stat] = buildPageStats([row], { from: FROM_NOON });

        expect(stat).toMatchObject({ views: 50, exits: 10 });
    });

    it('exclut une page dont les vues proratisées arrondissent à zéro, même avec des sorties', () => {
        const row = buildPageViewRow({ date: day(15), path: '/a', views: 1, exits: 1 });

        expect(buildPageStats([row], { from: FROM_18H })).toEqual([]);
    });

    it('exclut une page sans aucune vue', () => {
        expect(buildPageStats([buildPageViewRow({ views: 0, exits: 0 })], {})).toEqual([]);
    });
});

describe('buildSearchTermStats', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(buildSearchTermStats([], {})).toEqual([]);
    });

    it('agrège les recherches par terme et trie par volume décroissant', () => {
        const rows = [
            buildSearchRow({ date: day(14), term: 'épée', searches: 10 }),
            buildSearchRow({ date: day(15), term: 'épée', searches: 5 }),
            buildSearchRow({ date: day(14), term: 'bouclier', searches: 20 }),
        ];

        expect(buildSearchTermStats(rows, {})).toEqual([
            { term: 'bouclier', hasResults: true, searches: 20 },
            { term: 'épée', hasResults: true, searches: 15 },
        ]);
    });

    it('conserve `hasResults` de la première ligne rencontrée pour un terme', () => {
        const rows = [
            buildSearchRow({ date: day(14), term: 'dragon', hasResults: false, searches: 3 }),
            buildSearchRow({ date: day(15), term: 'dragon', hasResults: true, searches: 4 }),
        ];

        expect(buildSearchTermStats(rows, {})[0]).toEqual({ term: 'dragon', hasResults: false, searches: 7 });
    });

    it('ne modifie pas les lignes d\'origine en agrégeant', () => {
        const rows = [
            buildSearchRow({ date: day(14), term: 'épée', searches: 10 }),
            buildSearchRow({ date: day(15), term: 'épée', searches: 5 }),
        ];

        buildSearchTermStats(rows, {});

        expect(rows.map((row) => row.searches)).toEqual([10, 5]);
    });

    it('ne garde que la boutique demandée', () => {
        const rows = [
            buildSearchRow({ shopId: 'boutique-a', term: 'épée', searches: 10 }),
            buildSearchRow({ shopId: 'boutique-b', term: 'bouclier', searches: 99 }),
        ];

        expect(buildSearchTermStats(rows, { shop: 'boutique-a' }).map((stat) => stat.term)).toEqual(['épée']);
    });

    it('exclut les jours hors plage', () => {
        const rows = [
            buildSearchRow({ date: day(14), term: 'épée' }),
            buildSearchRow({ date: day(16), term: 'épée' }),
        ];

        expect(buildSearchTermStats(rows, { from: day(15), to: '2026-01-15T10:00:00.000Z' })).toEqual([]);
    });

    it('proratise les recherches du jour qui contient `from`', () => {
        const row = buildSearchRow({ date: day(15), term: 'épée', searches: 10 });

        expect(buildSearchTermStats([row], { from: FROM_NOON })).toEqual([{ term: 'épée', hasResults: true, searches: 5 }]);
    });

    it('exclut un terme dont les recherches proratisées arrondissent à zéro', () => {
        const row = buildSearchRow({ date: day(15), term: 'épée', searches: 1 });

        expect(buildSearchTermStats([row], { from: FROM_18H })).toEqual([]);
    });
});
