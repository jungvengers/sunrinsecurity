import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: UserRole;
      studentId: string | null;
      grade: number | null;
      classNum: number | null;
      number: number | null;
    };
  }

  interface User {
    role: UserRole;
    studentId: string | null;
    grade: number | null;
    classNum: number | null;
    number: number | null;
  }
}

function parseStudentName(name: string | null | undefined) {
  if (!name)
    return {
      studentId: null,
      realName: null,
      grade: null,
      classNum: null,
      number: null,
    };

  const match = name.match(/^(\d{5})(.+)$/);
  if (!match)
    return {
      studentId: null,
      realName: name,
      grade: null,
      classNum: null,
      number: null,
    };

  const studentId = match[1];
  const realName = match[2];
  const grade = parseInt(studentId[0]);
  const classNum = parseInt(studentId.slice(1, 3));
  const number = parseInt(studentId.slice(3, 5));

  return { studentId, realName, grade, classNum, number };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as never,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["state"],
      authorization: {
        params: {
          hd: "sunrint.hs.kr",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email?.endsWith("@sunrint.hs.kr")) {
          return false;
        }
      }
      return true;
    },
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          role: true,
          studentId: true,
          grade: true,
          classNum: true,
          number: true,
        },
      });

      if (dbUser && !dbUser.studentId && dbUser.name) {
        const parsed = parseStudentName(dbUser.name);
        if (parsed.studentId) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              name: parsed.realName,
              studentId: parsed.studentId,
              grade: parsed.grade,
              classNum: parsed.classNum,
              number: parsed.number,
            },
          });
          session.user.name = parsed.realName;
          session.user.studentId = parsed.studentId;
          session.user.grade = parsed.grade;
          session.user.classNum = parsed.classNum;
          session.user.number = parsed.number;
          session.user.id = user.id;
          session.user.role = dbUser.role;
          return session;
        }
      }

      session.user.id = user.id;
      session.user.role = dbUser?.role ?? "STUDENT";
      session.user.studentId = dbUser?.studentId ?? null;
      session.user.grade = dbUser?.grade ?? null;
      session.user.classNum = dbUser?.classNum ?? null;
      session.user.number = dbUser?.number ?? null;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
