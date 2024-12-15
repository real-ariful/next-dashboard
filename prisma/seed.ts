import { PrismaClient } from '@prisma/client';
// import { users, customers, invoices, revenue } from './placeholder-data';

const prisma = new PrismaClient();

// Define the main function that will handle database operations
async function main() {
	const users = [
		{
		  id: '410544b2-4001-4271-9855-fec4b6a6442a',
		  name: 'User',
		  email: 'user@nextmail.com',
		  password: '123456',
		},
		{
			id: '410544b2-4001-4271-9855-fec4b6a6442b',
			name: 'Admin',
			email: 'admin@nextmail.com',
			password: 'admin',
		  },
	  ];
	  
	  const customers = [
		{
		  id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
		  name: 'Evil Rabbit',
		  email: 'evil@rabbit.com',
		  image_url: '/customers/evil-rabbit.png',
		},
		{
		  id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
		  name: 'Delba de Oliveira',
		  email: 'delba@oliveira.com',
		  image_url: '/customers/delba-de-oliveira.png',
		},
		{
		  id: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
		  name: 'Lee Robinson',
		  email: 'lee@robinson.com',
		  image_url: '/customers/lee-robinson.png',
		},
		{
		  id: '76d65c26-f784-44a2-ac19-586678f7c2f2',
		  name: 'Michael Novotny',
		  email: 'michael@novotny.com',
		  image_url: '/customers/michael-novotny.png',
		},
		{
		  id: 'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9',
		  name: 'Amy Burns',
		  email: 'amy@burns.com',
		  image_url: '/customers/amy-burns.png',
		},
		{
		  id: '13D07535-C59E-4157-A011-F8D2EF4E0CBB',
		  name: 'Balazs Orban',
		  email: 'balazs@orban.com',
		  image_url: '/customers/balazs-orban.png',
		},
	  ];
	  
	  const invoices = [
		{
		  customer_id: customers[0].id,
		  amount: 15795,
		  status: 'pending',
		  date: '2022-12-06',
		},
		{
		  customer_id: customers[1].id,
		  amount: 20348,
		  status: 'pending',
		  date: '2022-11-14',
		},
		{
		  customer_id: customers[4].id,
		  amount: 3040,
		  status: 'paid',
		  date: '2022-10-29',
		},
		{
		  customer_id: customers[3].id,
		  amount: 44800,
		  status: 'paid',
		  date: '2023-09-10',
		},
		{
		  customer_id: customers[5].id,
		  amount: 34577,
		  status: 'pending',
		  date: '2023-08-05',
		},
		{
		  customer_id: customers[2].id,
		  amount: 54246,
		  status: 'pending',
		  date: '2023-07-16',
		},
		{
		  customer_id: customers[0].id,
		  amount: 666,
		  status: 'pending',
		  date: '2023-06-27',
		},
		{
		  customer_id: customers[3].id,
		  amount: 32545,
		  status: 'paid',
		  date: '2023-06-09',
		},
		{
		  customer_id: customers[4].id,
		  amount: 1250,
		  status: 'paid',
		  date: '2023-06-17',
		},
		{
		  customer_id: customers[5].id,
		  amount: 8546,
		  status: 'paid',
		  date: '2023-06-07',
		},
		{
		  customer_id: customers[1].id,
		  amount: 500,
		  status: 'paid',
		  date: '2023-08-19',
		},
		{
		  customer_id: customers[5].id,
		  amount: 8945,
		  status: 'paid',
		  date: '2023-06-03',
		},
		{
		  customer_id: customers[2].id,
		  amount: 1000,
		  status: 'paid',
		  date: '2022-06-05',
		},
	  ];
	  
	  const revenue = [
		{ month: 'Jan', revenue: 2000 },
		{ month: 'Feb', revenue: 1800 },
		{ month: 'Mar', revenue: 2200 },
		{ month: 'Apr', revenue: 2500 },
		{ month: 'May', revenue: 2300 },
		{ month: 'Jun', revenue: 3200 },
		{ month: 'Jul', revenue: 3500 },
		{ month: 'Aug', revenue: 3700 },
		{ month: 'Sep', revenue: 2500 },
		{ month: 'Oct', revenue: 2800 },
		{ month: 'Nov', revenue: 3000 },
		{ month: 'Dec', revenue: 4800 },
	  ]; 


	try {
		// for (let user of users) {
		// 	await prisma.user.create({
		// 		data: {
		// 			name: user.name,
		// 			email: user.email,
		// 			password: user.password,
		// 		},
		// 	});
		// }

		// for (let customer of customers) {
		// 	console.log(customer)
		// 	await prisma.customer.create({
		// 		data: {
		// 			name: customer.name,
		// 			email: customer.email,
		// 			imageUrl: customer.image_url,
		// 		},
		// 	});
		// }

		// for (let invoice of invoices) {
		// 	await prisma.invoice.create({
		// 	  data: {
		// 		customer_id: Number(invoice.customer_id), // Changed from customer_id to customerId
		// 		amount: invoice.amount,
		// 		status: invoice.status,
		// 		date: new Date(invoice.date), // Convert string date to Date object
		// 	  },
		// 	});
		//   }

		// for (let rev of revenue) {
		// 	await prisma.revenue.create({
		// 		data: {
		// 			month: rev.month,
		// 			revenue: rev.revenue,
		// 		},
		// 	});
		// }
		console.log('Database seeded successfully');
	  } catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	  } finally {
		// await prisma.$disconnect();
	  }
}

// Execute the main function and handle disconnection and errors
main()
	.then(() => prisma.$disconnect()) // Disconnect from the database on successful completion
	.catch(async (e) => {
		console.error(e); // Log any errors
		await prisma.$disconnect(); // Ensure disconnection even if an error occurs
		process.exit(1); // Exit the process with an error code
	});
