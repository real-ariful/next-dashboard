import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
// import type { User } from '@/app/lib/definitions';
import { createHashedPassword, verifyPassword } from '@/app/lib/actions';

async function getUser(email: string): Promise<User | null> {
  console.log('getUser')
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'  // This makes the search case-insensitive
        }
      },
    });
    console.log('getUser', user)
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

  
export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
      Credentials({
        
        async authorize(credentials) {
          console.log('NextAuth: credentials', credentials)
          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);
          
          console.log('parsedCredentials', parsedCredentials)
          if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
            console.log('email', email)
            console.log('password', password)
            const user = await getUser(email);
            console.log('parsedCredentials: user', user)
            if (!user) return null;
            console.log('parsedCredentials: password', password)
            console.log('parsedCredentials: user.password', user.password)

            const passwordsMatch = await verifyPassword(password, user.password)
            console.log('passwordsMatch', passwordsMatch)

            // const passwordsMatch = await bcrypt.compare(password, user.password);
            console.log('passwordsMatch', passwordsMatch);
            if (passwordsMatch) return user;
          }

          console.log('Invalid credentials');
          console.log('-------');
          return null;
        },
      }),
    ],
});