import { CardGroup, CardGroupTitle, CardGroupContent, Card, CardTitle, CardContent } from "../../../components/ui/Card";
import { PageTitle } from "../../../components/ui/PageTitle";
import { TotalCustomers } from "../../../components/dashboard/TotalCustomers";

export default function CustomersPage() {
    return (
        <div className="space-y-8">
            <PageTitle>Clients</PageTitle>
            <CardGroup>
                <CardGroupTitle>Base clients</CardGroupTitle>
                <CardGroupContent>
                    <Card>
                        <CardTitle>Nombre de clients</CardTitle>
                        <CardContent>
                            <TotalCustomers />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
        </div>
    );
}
