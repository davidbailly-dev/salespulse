import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KpiDelta } from './KpiDelta';

describe('KpiDelta', () => {
    it("n'affiche rien quand la comparaison est désactivée", () => {
        const { container } = render(<KpiDelta current={120} previous={undefined} polarity="higher-is-better" />);

        expect(container.textContent).toBe('');
    });

    it("n'affiche rien quand le KPI courant n'est pas calculable", () => {
        const { container } = render(<KpiDelta current={null} previous={100} polarity="higher-is-better" />);

        expect(container.textContent).toBe('');
    });

    it('affiche un tiret et signale la valeur N-1 indisponible', () => {
        render(<KpiDelta current={120} previous={null} polarity="higher-is-better" />);

        expect(screen.getByText('–', { exact: false })).toBeDefined();
        expect(screen.getByText('évolution par rapport à N-1 indisponible')).toBeDefined();
    });

    it("affiche en vert la hausse d'un KPI dont la hausse est une bonne nouvelle", () => {
        const { container } = render(<KpiDelta current={125} previous={100} polarity="higher-is-better" />);

        expect(container.firstElementChild?.className).toContain('text-success');
        expect(screen.getByText('+25,0 %')).toBeDefined();
        expect(screen.getByText('en hausse de 25,0 % par rapport à N-1')).toBeDefined();
    });

    it("affiche en vert la baisse d'un KPI dont la baisse est une bonne nouvelle", () => {
        const { container } = render(<KpiDelta current={80} previous={100} polarity="lower-is-better" />);

        expect(container.firstElementChild?.className).toContain('text-success');
        expect(screen.getByText('en baisse de 20,0 % par rapport à N-1')).toBeDefined();
    });

    it("affiche en rouge la hausse d'un KPI dont la hausse est une mauvaise nouvelle", () => {
        const { container } = render(<KpiDelta current={125} previous={100} polarity="lower-is-better" />);

        expect(container.firstElementChild?.className).toContain('text-danger');
    });

    it("exprime l'écart en points pour un KPI qui est déjà un taux", () => {
        render(<KpiDelta current={2.4} previous={2.1} polarity="higher-is-better" mode="points" />);

        expect(screen.getByText('+0,3 pt')).toBeDefined();
        expect(screen.getByText('en hausse de 0,3 pt par rapport à N-1')).toBeDefined();
    });
});
