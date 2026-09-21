import { CardGroup, CardGroupTitle, CardGroupContent, Card, CardTitle, CardContent } from "../../../components/ui/Card";
import { PageTitle } from "../../../components/ui/PageTitle";
import { RefundRate } from "../../../components/dashboard/RefundRate";
import { RefundedRevenue } from "../../../components/dashboard/RefundedRevenue";
import { AverageItemsPerOrder } from "../../../components/dashboard/AverageItemsPerOrder";
import { RevenueByStatus } from "../../../components/dashboard/RevenueByStatus";
import { TopCustomers } from "../../../components/dashboard/TopCustomers";

export default function SalesPage() {
    return (
        <div className="space-y-8">
            <PageTitle>Ventes</PageTitle>
            <CardGroup>
                <CardGroupTitle>Statuts des commandes</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Répartition du CA par statut</CardTitle>
                        <CardContent>
                            <RevenueByStatus />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Taux de remboursement</CardTitle>
                        <CardContent>
                            <RefundRate />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>CA perdu en remboursements</CardTitle>
                        <CardContent>
                            <RefundedRevenue />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
            <CardGroup>
                <CardGroupTitle>Commandes & clients</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Articles par commande</CardTitle>
                        <CardContent>
                            <AverageItemsPerOrder />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Top clients</CardTitle>
                        <CardContent>
                            <TopCustomers />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
        </div>
    );
}
