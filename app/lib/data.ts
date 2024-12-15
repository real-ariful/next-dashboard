import prisma from '@/lib/prisma';
import { formatCurrency } from './utils';
// import {
//   CustomerField,
//   CustomersTableType,
//   InvoiceForm,
//   InvoicesTable,
//   LatestInvoiceRaw,
//   Revenue,
// } from './definitions';

export async function fetchRevenue() {
  try {
    console.log('Fetching revenue data...');
    const data = await prisma.revenue.findMany({
      orderBy: {
        month: 'asc',
      },
    });
    console.log('Data fetch completed', data);
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await prisma.invoice.findMany({
      take: 5,
      orderBy: {
        date: 'desc',
      },
      select: {
        id: true,
        amount: true,
        customer: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    const [
      invoiceCount,
      customerCount,
      invoiceStatus
    ] = await Promise.all([
      prisma.invoice.count(),
      prisma.customer.count(),
      prisma.invoice.groupBy({
        by: ['status'],
        _sum: {
          amount: true,
        },
        where: {
          status: {
            in: ['paid', 'pending']
          }
        }
      })
    ]);

    const totalPaidInvoices = formatCurrency(
      invoiceStatus.find(status => status.status === 'paid')?._sum.amount ?? 0
    );
    const totalPendingInvoices = formatCurrency(
      invoiceStatus.find(status => status.status === 'pending')?._sum.amount ?? 0
    );

    return {
      numberOfCustomers: customerCount,
      numberOfInvoices: invoiceCount,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.invoice.findMany({
      skip: offset,
      take: ITEMS_PER_PAGE,
      where: {
        OR: [
          {
            customer: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            },
          },
          { amount: { equals: isNaN(Number(query)) ? undefined : Number(query) } },
          { date: { equals: isNaN(Date.parse(query)) ? undefined : new Date(query) } },
          { status: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        amount: true,
        date: true,
        status: true,
        customer: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await prisma.invoice.count({
      where: {
        OR: [
          {
            customer: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            },
          },
          { amount: { equals: isNaN(Number(query)) ? undefined : Number(query) } },
          { date: { equals: isNaN(Date.parse(query)) ? undefined : new Date(query) } },
          { status: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        customerId: true,
        amount: true,
        status: true,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return {
      ...invoice,
      amount: invoice.amount / 100, // Convert amount from cents to dollars
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return customers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        invoices: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return customers.map((customer) => {
      const totalInvoices = customer.invoices.length;
      const totalPending = customer.invoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0);
      const totalPaid = customer.invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);

      return {
        ...customer,
        total_invoices: totalInvoices,
        total_pending: formatCurrency(totalPending),
        total_paid: formatCurrency(totalPaid),
      };
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function fetchCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer.');
  }
}