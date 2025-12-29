import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function Header() {
  const session = await auth();

  const isClubAdmin = session?.user?.id
    ? await prisma.clubAdmin.findFirst({
        where: { userId: session.user.id },
      })
    : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between glass rounded-xl">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3">
              <svg
                className="w-6 h-8 text-white"
                viewBox="0 0 59 77"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M34.3226 10.3065C34.3226 13.0144 32.1273 15.2097 29.4194 15.2097C26.7114 15.2097 24.5161 13.0144 24.5161 10.3065C24.5161 7.59847 26.7114 5.40323 29.4194 5.40323C32.1273 5.40323 34.3226 7.59847 34.3226 10.3065ZM39.2258 10.3065C39.2258 12.125 38.7308 13.828 37.8681 15.2879L44.0508 21.4706C45.5107 20.6079 47.2137 20.1129 49.0323 20.1129C54.4482 20.1129 58.8387 24.5034 58.8387 29.9193C58.8387 35.3353 54.4482 39.7258 49.0323 39.7258C47.2136 39.7258 45.5106 39.2307 44.0506 38.368L37.868 44.5506C38.7307 46.0106 39.2258 47.7136 39.2258 49.5323C39.2258 53.9197 36.3445 57.6342 32.3709 58.8868L36.7742 76.5H22.0645L26.4678 58.8868C22.4942 57.6342 19.6129 53.9197 19.6129 49.5323C19.6129 48.3693 19.8154 47.2535 20.187 46.2184L13.1203 39.1518C12.0852 39.5233 10.9695 39.7258 9.80645 39.7258C4.3905 39.7258 0 35.3353 0 29.9193C0 24.5034 4.3905 20.1129 9.80645 20.1129C15.2224 20.1129 19.6129 24.5034 19.6129 29.9193C19.6129 32.3688 18.7148 34.6086 17.23 36.3272L23.0115 42.1087C24.7301 40.6239 26.9699 39.7258 29.4194 39.7258C31.2379 39.7258 32.9409 40.2209 34.4009 41.0835L40.5835 34.9009C39.7208 33.4409 39.2258 31.7379 39.2258 29.9193C39.2258 28.1007 39.7209 26.3976 40.5836 24.9376L34.4011 18.7551C32.9411 19.6178 31.238 20.1129 29.4194 20.1129C24.0034 20.1129 19.6129 15.7224 19.6129 10.3065C19.6129 4.8905 24.0034 0.5 29.4194 0.5C34.8353 0.5 39.2258 4.8905 39.2258 10.3065ZM34.3226 49.5323C34.3226 52.2402 32.1273 54.4355 29.4194 54.4355C26.7114 54.4355 24.5161 52.2402 24.5161 49.5323C24.5161 46.8243 26.7114 44.629 29.4194 44.629C32.1273 44.629 34.3226 46.8243 34.3226 49.5323ZM49.0323 34.8226C51.7402 34.8226 53.9355 32.6273 53.9355 29.9193C53.9355 27.2114 51.7402 25.0161 49.0323 25.0161C46.3243 25.0161 44.129 27.2114 44.129 29.9193C44.129 32.6273 46.3243 34.8226 49.0323 34.8226ZM14.7097 29.9193C14.7097 32.6273 12.5144 34.8226 9.80645 34.8226C7.09847 34.8226 4.90323 32.6273 4.90323 29.9193C4.90323 27.2114 7.09847 25.0161 9.80645 25.0161C12.5144 25.0161 14.7097 27.2114 14.7097 29.9193Z"
                />
              </svg>
              <span className="font-semibold hidden sm:block">정보보호과</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/project">프로젝트</NavLink>
              <NavLink href="/club">동아리</NavLink>
              <NavLink href="/apply">지원</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                {isClubAdmin && (
                  <Link
                    href="/club-admin"
                    className="text-sm px-3 py-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    동아리 관리
                  </Link>
                )}
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-sm px-3 py-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    관리자
                  </Link>
                )}
                <span className="text-sm text-[hsl(var(--muted-foreground))] hidden sm:block">
                  {session.user.name}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="text-sm px-3 py-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-white text-black hover:opacity-90 transition-opacity"
              >
                로그인
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm px-3 py-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--muted))] transition-all"
    >
      {children}
    </Link>
  );
}
