import { SimpleFaker } from '@faker-js/faker';
import type { Device, TrafficRow, WebVitalsRow } from './schemas';

const WEB_VITALS_SEED = 818181;

// Valeurs de base (p75) par appareil. Le mobile dépasse volontairement les seuils "bon" de Google
// (LCP 2,5 s, INP 200 ms, CLS 0,1) sans atteindre les seuils "mauvais" : c'est le cas courant
// d'un site correct sur desktop mais à optimiser sur mobile, et cohérent avec la conversion
// mobile plus faible de `trafficProfiles.ts`.
const BASE_WEB_VITALS: Record<Device, { lcpMs: number; inpMs: number; cls: number; loadTimeMs: number }> = {
    desktop: { lcpMs: 1900, inpMs: 120, cls: 0.05, loadTimeMs: 1700 },
    tablet: { lcpMs: 2400, inpMs: 180, cls: 0.08, loadTimeMs: 2400 },
    mobile: { lcpMs: 3100, inpMs: 240, cls: 0.12, loadTimeMs: 3200 },
};

/**
 * Core Web Vitals dérivés du trafic : les chargements de page mesurés d'une ligne sont les pages
 * vues de l'appareil ce jour-là. Seedé à part, comme les autres jeux analytics, pour ne modifier
 * aucune donnée existante.
 */
export function generateWebVitals(traffic: TrafficRow[]): WebVitalsRow[] {
    const random = new SimpleFaker();
    random.seed(WEB_VITALS_SEED);
    const jitter = (spread: number) => random.number.float({ min: 1 - spread, max: 1 + spread });

    const samplesByKey = new Map<string, { date: string; shopId: string; device: Device; samples: number }>();
    traffic.forEach(({ date, shopId, device, pageViews }) => {
        const key = `${date}|${shopId}|${device}`;
        const entry = samplesByKey.get(key);
        if (entry) entry.samples += pageViews;
        else samplesByKey.set(key, { date, shopId, device, samples: pageViews });
    });

    return [...samplesByKey.values()].map(({ date, shopId, device, samples }) => {
        const base = BASE_WEB_VITALS[device];

        return {
            date,
            shopId,
            device,
            samples,
            lcpMs: Math.round(base.lcpMs * jitter(0.08)),
            inpMs: Math.round(base.inpMs * jitter(0.08)),
            cls: Math.round(base.cls * jitter(0.1) * 1000) / 1000,
            loadTimeMs: Math.round(base.loadTimeMs * jitter(0.08)),
        };
    });
}
