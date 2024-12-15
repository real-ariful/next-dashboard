'use server';

import { z } from 'zod';
import { db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const client = await db.connect();

// createUser
export type UserState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

const UserFormSchema = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: 'Please provide first name.',
  }),
  email: z.string({
    invalid_type_error: 'Please provide email address.',
  }),
  password: z.string({
    invalid_type_error: 'Please provide password.',
  }),
  active: z.string(),
  createDate: z.string(),
});

const CreateUser = UserFormSchema.omit({ id: true, active: true, createDate: true });

export async function createUser(formData: FormData) {
// export async function createUser(prevState: UserState, formData: FormData) {
  console.log(formData)  
  const validatedFields = CreateUser.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });
  
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create User.',
      };
    }
    
    // Prepare data for insertion into the database
    const {name, email, password} = CreateUser.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });

    
    // Insert data into the database
    try {
      await client.sql`
        INSERT INTO users (name, email, password)
        VALUES (${name}, ${email}, ${password})
      `;
    } catch (error) {
      // If a database error occurs, return a more specific error.
      return {
        message: 'Database Error: Failed to Create User.',
      };
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

// 

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
  
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }
    
    // Prepare data for insertion into the database
    const { customerId, amount, status } = CreateInvoice.parse({
          customerId: formData.get('customerId'),
          amount: formData.get('amount'),
          status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    
    // Insert data into the database
    try {
      await client.sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
      // If a database error occurs, return a more specific error.
      return {
        message: 'Database Error: Failed to Create Invoice.',
      };
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  // Validate form fields using Zod
    const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
  
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
   
    try {
      await client.sql`
          UPDATE invoices
          SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
          WHERE id = ${id}
        `;
    } catch (error) {
      return { message: 'Database Error: Failed to Update Invoice.' };
    }
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  //throw new Error('Failed to Delete Invoice');
  try {
    await client.sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

//Customers
const CustomerFormSchema = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: 'Please provide name.',
  }),
  email: z.coerce
    .number()
    .gt(0, { message: 'Please provide email.' }),
  image_url: z.string(),
});

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
};

const CreateCustomer = CustomerFormSchema.omit({ id: true, date: true });

export async function createCustomer(prevState: CustomerStateState, formData: FormData) {
  // Validate form fields using Zod
    const validatedFields = CreateCustomer.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      image_url: formData.get('image_url'),
    });
  
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Customer.',
      };
    }
    
    // Prepare data for insertion into the database
    const { name, email, image_url } = CreateCustomer.parse({
          name: formData.get('name'),
          email: formData.get('email'),
          image_url: formData.get('image_url'),
    });

    // const amountInCents = amount * 100;
    // const date = new Date().toISOString().split('T')[0];
    
    // Insert data into the database
    try {
      await client.sql`
        INSERT INTO invoices (name, email, image_url)
        VALUES (${name}, ${email}, ${image_url})
      `;
    } catch (error) {
      // If a database error occurs, return a more specific error.
      return {
        message: 'Database Error: Failed to Create Customer.',
      };
    }

    // Revalidate the cache for the customers page and redirect the user.
    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}

const UpdateCustomer = CustomerFormSchema.omit({ id: true, date: true });

export async function updateCustomer(
  id: string,
  prevState: CustomerStateState,
  formData: FormData,
) {
  // Validate form fields using Zod
    const validatedFields = UpdateCustomer.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      image_url: formData.get('image_url'),
    });
  
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Customer.',
      };
    }

    const { name, email, image_url } = validatedFields.data;
    // const amountInCents = amount * 100;
   
    try {
      await client.sql`
          UPDATE invoices
          SET customer_id = ${name}, amount = ${email}, status = ${image_url}
          WHERE id = ${id}
        `;
    } catch (error) {
      return { message: 'Database Error: Failed to Update Customer.' };
    }
   
    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}

export async function deleteCustomer(id: string) {
  //throw new Error('Failed to Delete Customer');
  try {
    await client.sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/customers');
    return { message: 'Deleted Customer.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Customer.' };
  }
}