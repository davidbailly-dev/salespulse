import { ScoreGauge } from '../../components/charts/ScoreGauge';
import { CardGroup, CardGroupTitle, CardGroupContent, Card, CardTitle, CardContent } from '../../components/ui/Card';
import { PageTitle } from '../../components/ui/PageTitle';
import { Revenue } from '../../components/dashboard/Revenue';
import { TotalOrders } from '../../components/dashboard/TotalOrders';
import { AverageOrderValue } from '../../components/dashboard/AverageOrderValue';
import { TopProducts } from '../../components/dashboard/TopProducts';
import { TopCategories } from '../../components/dashboard/TopCategories';
import { DecliningProducts } from '../../components/dashboard/DecliningProducts';
import { ConversionRate } from '../../components/dashboard/ConversionRate';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <PageTitle>Dashboard</PageTitle>
            <CardGroup>
                <CardGroupTitle>Ventes & performances</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>CA</CardTitle>
                        <CardContent>
                            <Revenue></Revenue>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Commandes</CardTitle>
                        <CardContent>
                            <TotalOrders />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Panier moyen</CardTitle>
                        <CardContent>
                            <AverageOrderValue></AverageOrderValue>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Taux de conversion</CardTitle>
                        <CardContent>
                            <ConversionRate />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
            <CardGroup>
                <CardGroupTitle>Produits</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Top 5 produits</CardTitle>
                        <CardContent>
                            <TopProducts />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Produits en baisse</CardTitle>
                        <CardContent>
                            <DecliningProducts />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Top catégories</CardTitle>
                        <CardContent>
                            <TopCategories />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
            <CardGroup>
                <CardGroupTitle>Clients</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Récurrents vs nouveaux</CardTitle>
                        <CardContent>25% récurrents</CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Paniers abandonnés</CardTitle>
                        <CardContent>
                            <ScoreGauge value={14} unit="%"></ScoreGauge>
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
        </div>
    );
}
