import { CardGroup, CardGroupTitle, CardGroupContent, Card, CardTitle, CardContent } from "../../../components/ui/Card";
import { PageTitle } from "../../../components/ui/PageTitle";
import { TotalItemsSold } from "../../../components/dashboard/TotalItemsSold";
import { CatalogCoverage } from "../../../components/dashboard/CatalogCoverage";
import { NeverSoldProducts } from "../../../components/dashboard/NeverSoldProducts";
import { AverageSellingPrice } from "../../../components/dashboard/AverageSellingPrice";

export default function ProductsPage() {
    return (
        <div className="space-y-8">
            <PageTitle>Produits</PageTitle>
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
                </CardGroupContent>
            </CardGroup>
        </div>
    );
}