import Form from '@/app/ui/users/edit-form';
import Breadcrumbs from '@/app/ui/users/breadcrumbs';
import { fetchUserById, fetchUsers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const [user, users] = await Promise.all([
      fetchUserById(id),
      fetchUsers(),
    ]);
    if (!user) {
        notFound();
    }
     
    return (
        <main>
        <Breadcrumbs
            breadcrumbs={[
            { label: 'Users', href: '/dashboard/users' },
            {
                label: 'Edit User',
                href: `/dashboard/users/${id}/edit`,
                active: true,
            },
            ]}
        />
        <Form user={user} users={users} />
        </main>
    );
}