import type { DestinationStream } from 'pino';

export type LogLine = Record<string, unknown>;

// Destination de pino qui garde chaque ligne de journal, décodée, dans `lines` : les tests lisent
// ce qui serait écrit sur la sortie standard.
export function captureLogs(): { destination: DestinationStream; lines: LogLine[] } {
    const lines: LogLine[] = [];
    return {
        destination: {
            write: (line: string) => {
                lines.push(JSON.parse(line) as LogLine);
            },
        },
        lines,
    };
}
