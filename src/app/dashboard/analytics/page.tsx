import { CardGroup, CardGroupTitle } from '../../../components/ui/Card';
import { PageTitle } from '../../../components/ui/PageTitle';

// Sections de l'epic "Analytics" (voir docs/features-to-plan.md), les KPIs sont ajoutés étape par étape.
const sections = [
    'Acquisition',
    'Engagement',
    'Visites',
    'Rentabilité',
    'Fidélisation',
    'Qualité technique',
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <PageTitle>Analytics</PageTitle>
            {sections.map((section) => (
                <CardGroup key={section}>
                    <CardGroupTitle>{section}</CardGroupTitle>
                    <p className="text-sm text-gray-400">KPIs à venir</p>
                </CardGroup>
            ))}
        </div>
    );
}
