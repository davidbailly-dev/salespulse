import { CardGroup, CardGroupTitle, CardGroupContent, Card, CardTitle, CardContent } from "../../../components/ui/Card";
import { PageTitle } from "../../../components/ui/PageTitle";
import { TotalItemsSold } from "../../../components/dashboard/TotalItemsSold";

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
                </CardGroupContent>
            </CardGroup>
        </div>
    );
}