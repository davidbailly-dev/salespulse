import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { parseVersion, readVersion } from './version';

describe('parseVersion', () => {
    it('donne la version d’un package.json', () => {
        expect(parseVersion(JSON.stringify({ name: 'salespulse', version: '0.3.3' }))).toBe(
            '0.3.3',
        );
    });

    it('accepte une préversion', () => {
        expect(parseVersion(JSON.stringify({ version: '1.0.0-rc.1' }))).toBe('1.0.0-rc.1');
    });

    it.each([
        ['sans version', {}],
        ['à version vide', { version: '' }],
        ['à version numérique', { version: 1 }],
        ['à version incomplète', { version: '1.2' }],
        ['à version préfixée par v', { version: 'v1.2.3' }],
    ])('refuse un package.json %s', (_, packageJson) => {
        expect(() => parseVersion(JSON.stringify(packageJson))).toThrow(/version/);
    });

    it('refuse un contenu qui n’est pas du JSON', () => {
        expect(() => parseVersion('{ version: 1.2.3')).toThrow();
    });
});

describe('readVersion', () => {
    let directory: string;

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), 'salespulse-version-'));
    });

    afterEach(() => {
        rmSync(directory, { recursive: true, force: true });
    });

    it('lit la version du fichier donné', () => {
        const path = join(directory, 'package.json');
        writeFileSync(path, JSON.stringify({ version: '2.4.1' }));

        expect(readVersion(path)).toBe('2.4.1');
    });

    it('nomme le fichier quand sa version est invalide', () => {
        const path = join(directory, 'package.json');
        writeFileSync(path, JSON.stringify({ name: 'sans-version' }));

        expect(() => readVersion(path)).toThrow(path);
    });

    it('refuse un fichier absent', () => {
        expect(() => readVersion(join(directory, 'absent.json'))).toThrow(/ENOENT/);
    });
});
