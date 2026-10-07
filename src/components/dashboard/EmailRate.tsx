'use client';

import { calculateEmailRates, type EmailMetric } from '../../lib/kpis/emailRates';
import { useEmails } from '../../lib/queries/useEmails';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import type { EmailCampaign } from '../../lib/mock-data/schemas';
import { CardList } from '../ui/Card';

const campaignLabels: Record<EmailCampaign, string> = {
    newsletter: 'Newsletters',
    cart_recovery: 'Relances de panier',
};

const rateFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function EmailRate({ metric }: { metric: EmailMetric }) {
    const { data: emails, isLoading, isError } = useEmails(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const items = calculateEmailRates(emails, metric).map(({ campaign, rate }) => ({
        id: campaign,
        label: campaignLabels[campaign],
        value: `${rateFormatter.format(rate)} %`,
    }));

    return <CardList items={items} />;
}
