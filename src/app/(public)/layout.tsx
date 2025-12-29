import { Header } from "@/components/header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-16">{children}</main>
    </>
  );
}
