import { CardGroup, CardGroupTitle, CardGroupContent, Card, CardTitle, CardContent } from "../../../components/ui/Card";
import { PageTitle } from "../../../components/ui/PageTitle";
import { RefundRate } from "../../../components/dashboard/RefundRate";

export default function SalesPage() {
    return (
        <div className="space-y-8">
            <PageTitle>Ventes</PageTitle>
            <CardGroup>
                <CardGroupTitle>Statuts des commandes</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Taux de remboursement</CardTitle>
                        <CardContent>
                            <RefundRate />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
        </div>
    );
}
