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
import { EngagementRate } from '../../../components/dashboard/EngagementRate';
import { AverageSessionDuration } from '../../../components/dashboard/AverageSessionDuration';
import { PagesPerSession } from '../../../components/dashboard/PagesPerSession';
import { DeepScrollRate } from '../../../components/dashboard/DeepScrollRate';
import { ExitPages } from '../../../components/dashboard/ExitPages';
import { TopSearchTerms } from '../../../components/dashboard/TopSearchTerms';
import { NoResultSearches } from '../../../components/dashboard/NoResultSearches';
import { TopPages } from '../../../components/dashboard/TopPages';
import { RevenuePerVisit } from '../../../components/dashboard/RevenuePerVisit';
import { Roas } from '../../../components/dashboard/Roas';
import { CostPerClick } from '../../../components/dashboard/CostPerClick';
import { CostPerVisit } from '../../../components/dashboard/CostPerVisit';
import { CustomerAcquisitionCost } from '../../../components/dashboard/CustomerAcquisitionCost';
import { LtvCacRatio } from '../../../components/dashboard/LtvCacRatio';
import { WebVitalByDevice } from '../../../components/dashboard/WebVitalByDevice';
import { SessionsByDevice } from '../../../components/dashboard/SessionsByDevice';
import { ConversionByDevice } from '../../../components/dashboard/ConversionByDevice';
import { NotFoundRate } from '../../../components/dashboard/NotFoundRate';
import { PaymentFailureRate } from '../../../components/dashboard/PaymentFailureRate';
import { EmailRate } from '../../../components/dashboard/EmailRate';

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
            <CardGroup>
                <CardGroupTitle>Engagement</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Taux d&apos;engagement</CardTitle>
                        <CardContent>
                            <EngagementRate />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Durée moyenne de session</CardTitle>
                        <CardContent>
                            <AverageSessionDuration />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Pages par session</CardTitle>
                        <CardContent>
                            <PagesPerSession />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Scroll profond</CardTitle>
                        <CardContent>
                            <DeepScrollRate />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Pages de sortie</CardTitle>
                        <CardContent>
                            <ExitPages />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Recherches internes</CardTitle>
                        <CardContent>
                            <TopSearchTerms />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Recherches sans résultat</CardTitle>
                        <CardContent>
                            <NoResultSearches />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
            <CardGroup>
                <CardGroupTitle>Visites</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Pages les plus vues</CardTitle>
                        <CardContent>
                            <TopPages type="all" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Pages produits les plus vues</CardTitle>
                        <CardContent>
                            <TopPages type="product" />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
            <CardGroup>
                <CardGroupTitle>Rentabilité</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Revenu par visite</CardTitle>
                        <CardContent>
                            <RevenuePerVisit />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>ROAS</CardTitle>
                        <CardContent>
                            <Roas />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Coût par clic (CPC)</CardTitle>
                        <CardContent>
                            <CostPerClick />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Coût par visite (CPV)</CardTitle>
                        <CardContent>
                            <CostPerVisit />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Coût d&apos;acquisition client (CAC)</CardTitle>
                        <CardContent>
                            <CustomerAcquisitionCost />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Ratio LTV/CAC</CardTitle>
                        <CardContent>
                            <LtvCacRatio />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
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
                    <Card>
                        <CardTitle>Taux d&apos;ouverture des e-mails</CardTitle>
                        <CardContent>
                            <EmailRate metric="open" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Taux de clic des e-mails</CardTitle>
                        <CardContent>
                            <EmailRate metric="click" />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
            <CardGroup>
                <CardGroupTitle>Qualité technique</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>LCP (chargement principal)</CardTitle>
                        <CardContent>
                            <WebVitalByDevice metric="lcp" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>INP (réactivité)</CardTitle>
                        <CardContent>
                            <WebVitalByDevice metric="inp" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>CLS (stabilité visuelle)</CardTitle>
                        <CardContent>
                            <WebVitalByDevice metric="cls" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Temps de chargement</CardTitle>
                        <CardContent>
                            <WebVitalByDevice metric="loadTime" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Sessions par appareil</CardTitle>
                        <CardContent>
                            <SessionsByDevice />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Conversion des sessions (par appareil)</CardTitle>
                        <CardContent>
                            <ConversionByDevice />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Taux de 404</CardTitle>
                        <CardContent>
                            <NotFoundRate />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Échecs de paiement</CardTitle>
                        <CardContent>
                            <PaymentFailureRate />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
        </div>
    );
}
