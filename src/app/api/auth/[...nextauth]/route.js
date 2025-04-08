// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '../../../../lib/db';
import { getUserModel } from '../../../../models/User';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

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
          const User = await getUserModel();

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

            // Check auth method to prevent Google users from signing in with credentials
            if (user.authMethod === 'google') {
              throw new Error('This account uses Google sign-in. Please use Google to sign in.');
            }

            if (!user.password) {
              throw new Error('No password set for this account. Please use Google to sign in.');
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
  callbacks: {
    async session({ session, token }) {
      await connectToDatabase();
      const User = await getUserModel();
      const user = await User.findById(token.sub);
      if (user) {
        session.user.id = token.sub;
        session.user.subscription = user.subscription || 'free';
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        await connectToDatabase();
        console.log('Mongoose connection state in signIn:', mongoose.connection.readyState);
        const User = await getUserModel();

        let existingUser = await User.findOne({ email: user.email });
        console.log('Existing Google user:', existingUser);

        if (!existingUser) {
          // Create a new user (sign-up)
          const newUser = new User({
            email: user.email,
            name: user.name || profile.name,
            googleId: account.providerAccountId, // Store Google ID
            authMethod: 'google', // Set auth method
            password: null, // No password for Google users
          });
          await newUser.save();
          console.log('New Google user saved:', newUser);
          user.id = newUser._id.toString();

          // Redirect to sign-in page after Google sign-up
          return `/signin?email=${encodeURIComponent(user.email)}`;
        } else {
          // Update existing user with googleId if not set
          if (!existingUser.googleId) {
            existingUser.googleId = account.providerAccountId;
            existingUser.authMethod = 'google';
            await existingUser.save();
            console.log('Updated existing user with Google ID:', existingUser);
          }

          // Check if the user signed up with credentials
          if (existingUser.authMethod === 'credentials') {
            return `/signin?error=${encodeURIComponent('This email is already registered with a password. Please sign in with your credentials or use a different Google account.')}`;
          }

          user.id = existingUser._id.toString();
          return true; // Allow sign-in
        }
      }
      return true; // Allow sign-in for credentials provider
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error', // Optional: Create an error page for better UX
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };