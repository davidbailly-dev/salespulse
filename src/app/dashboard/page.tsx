import { ScoreGauge } from '../../components/charts/ScoreGauge';
import { CardGroup, CardGroupTitle, CardGroupContent, Card, CardTitle, CardContent } from '../../components/ui/Card';
import { PageTitle } from '../../components/ui/PageTitle';
import { Revenue } from '../../components/dashboard/Revenue';

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
                        <CardContent>750 commandes</CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Panier moyen</CardTitle>
                        <CardContent>75 €</CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Taux de conversion</CardTitle>
                        <CardContent>
                            <ScoreGauge value={25}></ScoreGauge>
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
            <CardGroup>
                <CardGroupTitle>Produits</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Top 5</CardTitle>
                        <CardContent>
                            <ul>
                                <li>1. Produit A</li>
                                <li>2. Produit B</li>
                                <li>3. Produit C</li>
                                <li>4. Produit D</li>
                                <li>5. Produit F</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Produits en baisse</CardTitle>
                        <CardContent>
                            <ul>
                                <li>1. Produit V <span className="text-danger">-25%</span></li>
                                <li>2. Produit W <span className="text-danger">-20%</span></li>
                                <li>3. Produit X <span className="text-danger">-15%</span></li>
                                <li>4. Produit Y <span className="text-danger">-10%</span></li>
                                <li>5. Produit Z <span className="text-danger">-5%</span></li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Top catégories</CardTitle>
                        <CardContent>
                            <ul>
                                <li>1. Catégorie A | 17 000 €</li>
                                <li>2. Catégorie B | 12 000 €</li>
                                <li>3. Catégorie C | 10 000 €</li>
                                <li>4. Catégorie D | 9000 €</li>
                                <li>5. Catégorie F | 7500 €</li>
                            </ul>
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
                        <CardContent>15%</CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
        </div>
    );
}