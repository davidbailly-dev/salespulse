import { CardGroup, CardGroupTitle, CardGroupContent, Card, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageTitle } from '../../../components/ui/PageTitle';
import { RecurringCustomers } from '../../../components/dashboard/RecurringCustomers';
import { RepurchaseRate } from '../../../components/dashboard/RepurchaseRate';
import { AverageTimeBetweenOrders } from '../../../components/dashboard/AverageTimeBetweenOrders';
import { CustomerLifetimeValue } from '../../../components/dashboard/CustomerLifetimeValue';
import { Sessions } from '../../../components/dashboard/Sessions';
import { UniqueVisitors } from '../../../components/dashboard/UniqueVisitors';
import { TrafficSources } from '../../../components/dashboard/TrafficSources';
import { NewVsReturningVisitors } from '../../../components/dashboard/NewVsReturningVisitors';

// Section de l'epic "Analytics" (voir docs/features-to-plan.md) pas encore codée :
// les KPIs sont ajoutés étape par étape.
function UpcomingSection({ title }: { title: string }) {
    return (
        <CardGroup>
            <CardGroupTitle>{title}</CardGroupTitle>
            <p className="text-sm text-gray-400">KPIs à venir</p>
        </CardGroup>
    );
}

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <PageTitle>Analytics</PageTitle>
            <CardGroup>
                <CardGroupTitle>Acquisition</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Sessions</CardTitle>
                        <CardContent>
                            <Sessions />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Visiteurs uniques</CardTitle>
                        <CardContent>
                            <UniqueVisitors />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Sources de trafic</CardTitle>
                        <CardContent>
                            <TrafficSources />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Visiteurs nouveaux vs récurrents</CardTitle>
                        <CardContent>
                            <NewVsReturningVisitors />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
            <UpcomingSection title="Engagement" />
            <UpcomingSection title="Visites" />
            <UpcomingSection title="Rentabilité" />
            <CardGroup>
                <CardGroupTitle>Fidélisation</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Récurrents vs nouveaux</CardTitle>
                        <CardContent>
                            <RecurringCustomers />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Taux de réachat</CardTitle>
                        <CardContent>
                            <RepurchaseRate />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Délai entre deux commandes</CardTitle>
                        <CardContent>
                            <AverageTimeBetweenOrders />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Valeur vie client (LTV)</CardTitle>
                        <CardContent>
                            <CustomerLifetimeValue />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
            <UpcomingSection title="Qualité technique" />
        </div>
    );
}
