import { CardGroup, CardGroupTitle, CardGroupContent, Card, CardTitle, CardContent } from "../../../components/ui/Card";
import { PageTitle } from "../../../components/ui/PageTitle";
import { TotalCustomers } from "../../../components/dashboard/TotalCustomers";
import { CustomerActivationRate } from "../../../components/dashboard/CustomerActivationRate";
import { NeverConvertedCustomers } from "../../../components/dashboard/NeverConvertedCustomers";

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
                    <Card>
                        <CardTitle>Taux d&apos;activation</CardTitle>
                        <CardContent>
                            <CustomerActivationRate />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardTitle>Clients jamais convertis</CardTitle>
                        <CardContent>
                            <NeverConvertedCustomers />
                        </CardContent>
                    </Card>
                </CardGroupContent>
            </CardGroup>
        </div>
    );
}
