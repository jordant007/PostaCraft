// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '../../../../lib/db';
import { getUserModel } from '../../../../models/User'; // Use getUserModel instead of direct import
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Remove the direct User import and console.log since we're using getUserModel

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        action: { label: 'Action', type: 'text' },
      },
      async authorize(credentials) {
        try {
          await connectToDatabase();
          console.log('Mongoose connection state in authorize:', mongoose.connection.readyState);
          const User = await getUserModel(); // Use getUserModel to get the User model

          const { email, password, name, action } = credentials;

          if (action === 'signup') {
            // Sign-up logic
            const existingUser = await User.findOne({ email });
            console.log('Existing user during signup:', existingUser);
            if (existingUser) {
              throw new Error('User already exists. Please sign in instead.');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
              email,
              name,
              password: hashedPassword,
              authMethod: 'credentials',
            });
            await newUser.save();
            console.log('New user created:', newUser);

            return { id: newUser._id, email: newUser.email, name: newUser.name };
          } else {
            // Sign-in logic
            const user = await User.findOne({ email });
            console.log('User found during signin:', user);
            if (!user) {
              throw new Error('No user found with this email.');
            }

            if (!user.password) {
              throw new Error('This account uses Google sign-in. Please use Google to sign in.');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
              throw new Error('Invalid password.');
            }

            return { id: user._id, email: user.email, name: user.name };
          }
        } catch (error) {
          console.error('Authentication error:', error.message);
          throw new Error(error.message || 'Failed to authenticate. Please try again later.');
        }
      },
    }),
  ],
  // Remove the deprecated database option
  callbacks: {
    async session({ session, token }) {
      await connectToDatabase();
      const User = await getUserModel();
      const user = await User.findById(token.sub);
      if (user) {
        session.user.id = token.sub;
        session.user.subscription = user.subscription || 'free'; // Add subscription to session
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        await connectToDatabase();
        console.log('Mongoose connection state in signIn:', mongoose.connection.readyState);
        const User = await getUserModel();

        const existingUser = await User.findOne({ email: user.email });
        console.log('Existing Google user:', existingUser);
        if (!existingUser) {
          const newUser = new User({
            email: user.email,
            name: user.name,
            authMethod: 'google',
          });
          await newUser.save();
          console.log('New Google user saved:', newUser);
        }
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };