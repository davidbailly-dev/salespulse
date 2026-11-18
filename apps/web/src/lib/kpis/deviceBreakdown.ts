import { Device, Order, TrafficRow } from '@salespulse/contracts';

export type DeviceSessions = {
    device: Device;
    sessions: number;
    // Part des sessions totales, arrondie à l'entier : la somme des parts peut donc valoir 99 ou 101.
    share: number;
};

export type DeviceConversion = {
    device: Device;
    // En %, 2 décimales : les taux de conversion sont de l'ordre de 1 à 4 %.
    rate: number;
};

function sumSessionsByDevice(traffic: TrafficRow[]): Map<Device, number> {
    const sessionsByDevice = new Map<Device, number>();
    traffic.forEach((row) => sessionsByDevice.set(row.device, (sessionsByDevice.get(row.device) ?? 0) + row.sessions));

    return sessionsByDevice;
}

/** Répartition des sessions par appareil, de la plus grande part à la plus petite. */
export function calculateSessionsByDevice(traffic: TrafficRow[]): DeviceSessions[] {
    const sessionsByDevice = sumSessionsByDevice(traffic);
    const totalSessions = [...sessionsByDevice.values()].reduce((total, sessions) => total + sessions, 0);
    if (totalSessions === 0) return [];

    return [...sessionsByDevice.entries()]
        .map(([device, sessions]) => ({ device, sessions, share: Math.round((sessions / totalSessions) * 100) }))
        .sort((a, b) => b.sessions - a.sessions);
}

/**
 * Conversion par appareil : commandes completed de l'appareil / sessions de l'appareil. C'est un
 * vrai taux sessions -> achat, à ne pas confondre avec le "Taux de conversion" du dashboard, un
 * proxy calculé sur les commandes seules (pas de notion de visite dans ce calcul-là).
 */
export function calculateConversionByDevice(orders: Order[], traffic: TrafficRow[]): DeviceConversion[] {
    const completedOrdersByDevice = new Map<Device, number>();
    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) =>
            completedOrdersByDevice.set(order.device, (completedOrdersByDevice.get(order.device) ?? 0) + 1),
        );

    return [...sumSessionsByDevice(traffic).entries()]
        .filter(([, sessions]) => sessions > 0)
        .map(([device, sessions]) => ({
            device,
            rate: Math.round(((completedOrdersByDevice.get(device) ?? 0) / sessions) * 10000) / 100,
        }))
        .sort((a, b) => b.rate - a.rate);
}
