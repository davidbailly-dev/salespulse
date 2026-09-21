import { CardGroup, CardGroupTitle, CardGroupContent, Card, CardTitle, CardContent } from "../../../components/ui/Card";
import { PageTitle } from "../../../components/ui/PageTitle";
import { TopProducts } from "../../../components/dashboard/TopProducts";
import { TotalItemsSold } from "../../../components/dashboard/TotalItemsSold";
import { CatalogCoverage } from "../../../components/dashboard/CatalogCoverage";
import { NeverSoldProducts } from "../../../components/dashboard/NeverSoldProducts";
import { AverageSellingPrice } from "../../../components/dashboard/AverageSellingPrice";
import { SalesConcentration } from "../../../components/dashboard/SalesConcentration";

export default function ProductsPage() {
    return (
        <div className="space-y-8">
            <PageTitle>Produits</PageTitle>
            <CardGroup>
                <CardGroupTitle>Vue d&apos;ensemble</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Top 5 produits</CardTitle>
                        <CardContent>
                            <TopProducts />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
            <CardGroup>
                <CardGroupTitle>Catalogue & ventes</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Articles vendus</CardTitle>
                        <CardContent>
                            <TotalItemsSold />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Couverture catalogue</CardTitle>
                        <CardContent>
                            <CatalogCoverage />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Produits jamais vendus</CardTitle>
                        <CardContent>
                            <NeverSoldProducts />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Prix de vente moyen</CardTitle>
                        <CardContent>
                            <AverageSellingPrice />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Concentration des ventes</CardTitle>
                        <CardContent>
                            <SalesConcentration />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
        </div>
    );
}