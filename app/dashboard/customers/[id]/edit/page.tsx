import Form from '@/app/ui/customers/edit-form';
import Breadcrumbs from '@/app/ui/customers/breadcrumbs';
import { fetchCustomerById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const [customer, customers] = await Promise.all([
      fetchCustomerById(id),
      fetchCustomers(),
    ]);
    if (!customers) {
        notFound();
    }
     
    return (
        <main>
        <Breadcrumbs
            breadcrumbs={[
            { label: 'Customers', href: '/dashboard/customers' },
            {
                label: 'Edit Customer',
                href: `/dashboard/customers/${id}/edit`,
                active: true,
            },
            ]}
        />
        <Form customer={customer} customers={customers} />
        </main>
    );
}