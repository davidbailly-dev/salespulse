import type { Channel, Device } from '@salespulse/contracts';

// Paramètres partagés par les deux générateurs : `generator.ts` s'en sert pour attribuer un
// canal et un appareil aux commandes (poids `orderWeight`), `analyticsGenerator.ts` pour
// produire un trafic cohérent avec ces commandes (taux de conversion, engagement...).
// Un canal ou un appareil qui convertit mal doit donc avoir beaucoup de sessions pour peu
// de commandes (ex. mobile : beaucoup de trafic, conversion plus faible).

export const CHANNELS: Channel[] = ['organic', 'paid', 'direct', 'social', 'email', 'referral'];
export const DEVICES: Device[] = ['desktop', 'mobile', 'tablet'];

// Taux de conversion (commandes completed / sessions) d'une session "moyenne", multiplié par
// les facteurs du canal et de l'appareil ci-dessous.
export const BASE_CONVERSION_RATE = 0.025;

type ChannelProfile = {
    // Poids du canal dans l'attribution des commandes.
    orderWeight: number;
    // Multiplicateur du taux de conversion de base.
    conversionFactor: number;
    // Part de nouveaux visiteurs parmi les visiteurs du canal.
    newUserShare: number;
    // Écart au taux d'engagement de base, et multiplicateurs de durée de session et de pages par session.
    engagementDelta: number;
    durationFactor: number;
    pagesFactor: number;
};

export const CHANNEL_PROFILES: Record<Channel, ChannelProfile> = {
    organic: { orderWeight: 30, conversionFactor: 1.0, newUserShare: 0.65, engagementDelta: 0, durationFactor: 1.0, pagesFactor: 1.0 },
    paid: { orderWeight: 25, conversionFactor: 0.8, newUserShare: 0.75, engagementDelta: -0.05, durationFactor: 0.85, pagesFactor: 0.9 },
    direct: { orderWeight: 20, conversionFactor: 1.6, newUserShare: 0.3, engagementDelta: 0.05, durationFactor: 1.2, pagesFactor: 1.2 },
    social: { orderWeight: 8, conversionFactor: 0.5, newUserShare: 0.7, engagementDelta: -0.15, durationFactor: 0.7, pagesFactor: 0.7 },
    email: { orderWeight: 12, conversionFactor: 2.2, newUserShare: 0.2, engagementDelta: 0.1, durationFactor: 1.15, pagesFactor: 1.1 },
    referral: { orderWeight: 5, conversionFactor: 1.2, newUserShare: 0.7, engagementDelta: 0, durationFactor: 1.0, pagesFactor: 1.0 },
};

type DeviceProfile = {
    orderWeight: number;
    conversionFactor: number;
    engagementDelta: number;
    durationFactor: number;
    pagesFactor: number;
};

export const DEVICE_PROFILES: Record<Device, DeviceProfile> = {
    mobile: { orderWeight: 50, conversionFactor: 0.6, engagementDelta: -0.05, durationFactor: 0.85, pagesFactor: 0.9 },
    desktop: { orderWeight: 42, conversionFactor: 1.4, engagementDelta: 0.05, durationFactor: 1.3, pagesFactor: 1.25 },
    tablet: { orderWeight: 8, conversionFactor: 1.0, engagementDelta: 0, durationFactor: 1.0, pagesFactor: 1.0 },
};

export function getConversionRate(channel: Channel, device: Device): number {
    return BASE_CONVERSION_RATE * CHANNEL_PROFILES[channel].conversionFactor * DEVICE_PROFILES[device].conversionFactor;
}
