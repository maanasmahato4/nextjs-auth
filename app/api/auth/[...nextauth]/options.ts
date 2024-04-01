import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import User from "@/app/(models)/user";

export const options = {
  providers: [
    GithubProvider({
      profile(profile) {
        let userRole = "user";
        if (profile?.email === "maanasmahato456@gmail.com") {
          userRole = "admin";
        }
        return {
          ...profile,
          id: profile.id.toString(),
          role: userRole,
        };
      },
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_Secret as string,
    }),
    GoogleProvider({
      profile(profile) {
        let userRole = "user";
        if (profile.email === "maanasmahato456@gmail.com") {
          userRole = "admin";
        }

        return {
          ...profile,
          id: profile.sub.toString(),
          role: userRole,
        };
      },
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_Secret as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "email:",
          type: "text",
          placeholder: "your-email",
        },
        password: {
          label: "password:",
          type: "password",
          placeholder: "your-password",
        },
      },
      async authorize(credentials) {
        try {
          const foundUser = await User.findOne({ email: credentials.email })
            .lean()
            .exec();

          if (foundUser) {
            console.log("User Exists");
            const match = await bcrypt.compare(
              credentials.password,
              foundUser.password
            );

            if (match) {
              console.log("Good Pass");
              delete foundUser.password;

              foundUser["role"] = "Unverified Email";
              return foundUser;
            }
          }
        } catch (error) {
          console.log(error);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.role = token.role;
      } else {
        session.user = session.user || {};
      }
      return session;
    },
  },
};
