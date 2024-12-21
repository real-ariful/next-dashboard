'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import prisma from '@/lib/prisma';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

//Authentications
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  console.log('authenticate')
  try {
    console.log('formData')
    await signIn('credentials', formData);
  } catch (error) {
    console.log('error', error)
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

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt);

export async function createHashedPassword(password: string) {
  try {
    // Get AUTH_SECRET from environment
    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
      throw new Error('AUTH_SECRET is not defined in environment variables');
    }

    // Create a unique salt for this user
    const salt = randomBytes(16).toString('hex');
    
    // Hash password with salt and AUTH_SECRET
    const hash = await scryptAsync(password, salt + authSecret, 64) as Buffer;

    // Combine salt and hash
    const hashedPassword = `${salt}:${hash.toString('hex')}`;
    
    return hashedPassword;

  } catch (error) {
    console.error('Error creating hashed password:', error);
    throw new Error('Failed to hash password');
  }
}

// Function to verify password
export async function verifyPassword(password: string, hashedPassword: string) {
  try {
    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
      throw new Error('AUTH_SECRET is not defined in environment variables');
    }

    // Extract salt from stored hash
    const [salt, storedHash] = hashedPassword.split(':');
    
    // Hash the input password with same salt
    const hash = (await scryptAsync(password, salt + authSecret, 64)) as Buffer;
    
    // Compare hashes
    return storedHash === hash.toString('hex');

  } catch (error) {
    console.error('Error verifying password:', error);
    throw new Error('Failed to verify password');
  }
}


// User actions
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
  const validatedFields = CreateUser.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create User.',
    };
  }

  console.log('data', validatedFields.data);
  let { name, email, password } = validatedFields.data;
  password = await createHashedPassword(password);
  console.log('hashedPassword', password);
  console.log(typeof password);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        // active: true,
      },
    });
    console.log('user', user);
  } catch (error) {
    console.log('error', error);
    
    return {
      message: 'Database Error: Failed to Create User.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateUser(
  id: string,
  prevState: UserState,
  formData: FormData,
) {
  const validatedFields = CreateUser.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    imageUrl: formData.get('image_url'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update User.',
    };
  }

  const { name, email, imageUrl } = validatedFields.data;

  try {
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        imageUrl,
      },
    });
  } catch (error) {
    return { message: 'Database Error: Failed to Update User.' };
  }

  revalidatePath('/dashboard/users');
  redirect('/dashboard/users');
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    revalidatePath('/dashboard/users');
    return { message: 'Deleted User.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete User.' };
  }
}



// Invoice actions
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
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await prisma.invoice.create({
      data: {
        customerId: parseInt(customerId),
        amount: amountInCents,
        status,
        date: new Date(),
      },
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        customerId: parseInt(customerId),
        amount: amountInCents,
        status,
      },
    });
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({
      where: { id: parseInt(id) },
    });
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

// Customer actions
const CustomerFormSchema = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: 'Please provide name.',
  }),
  email: z.string({
    invalid_type_error: 'Please provide email.',
  }),
  imageUrl: z.string(),
});

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
};

const CreateCustomer = CustomerFormSchema.omit({ id: true });

export async function createCustomer(prevState: CustomerState, formData: FormData) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    imageUrl: formData.get('image_url'),
  });

  console.log(validatedFields);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }

  const { name, email, imageUrl } = validatedFields.data;

  try {
    await prisma.customer.create({
      data: {
        name,
        email,
        imageUrl,
      },
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Customer.',
    };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData,
) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    imageUrl: formData.get('image_url'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
    };
  }

  const { name, email, imageUrl } = validatedFields.data;

  try {
    await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        imageUrl,
      },
    });
  } catch (error) {
    return { message: 'Database Error: Failed to Update Customer.' };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({
      where: { id: parseInt(id) },
    });
    revalidatePath('/dashboard/customers');
    return { message: 'Deleted Customer.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Customer.' };
  }
}