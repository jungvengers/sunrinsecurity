import { prisma } from "@/lib/prisma";
import { StorageImage } from "@/components/storage-image";
import Link from "next/link";

export default async function HomePage() {
  const appearanceSettings = await prisma.siteSettings.findUnique({
    where: { key: "appearance" },
  });
  const appearance =
    (appearanceSettings?.value as Record<string, unknown>) || {};
  const backgroundImage = (appearance.backgroundImage as string) || "";

  return (
    <>
      <section className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden -mt-16">
        {backgroundImage && (
          <div className="absolute inset-0 z-0">
            <StorageImage
              src={backgroundImage}
              alt="배경"
              fill
              className="object-cover blur-[2px] scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
          </div>
        )}

        <div className="text-center px-6 max-w-4xl mx-auto relative z-10 drop-shadow-2xl">
          <div className="mb-8">
            <svg
              className="w-16 h-20 mx-auto text-white mb-6 drop-shadow-lg"
              viewBox="0 0 59 77"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M34.3226 10.3065C34.3226 13.0144 32.1273 15.2097 29.4194 15.2097C26.7114 15.2097 24.5161 13.0144 24.5161 10.3065C24.5161 7.59847 26.7114 5.40323 29.4194 5.40323C32.1273 5.40323 34.3226 7.59847 34.3226 10.3065ZM39.2258 10.3065C39.2258 12.125 38.7308 13.828 37.8681 15.2879L44.0508 21.4706C45.5107 20.6079 47.2137 20.1129 49.0323 20.1129C54.4482 20.1129 58.8387 24.5034 58.8387 29.9193C58.8387 35.3353 54.4482 39.7258 49.0323 39.7258C47.2136 39.7258 45.5106 39.2307 44.0506 38.368L37.868 44.5506C38.7307 46.0106 39.2258 47.7136 39.2258 49.5323C39.2258 53.9197 36.3445 57.6342 32.3709 58.8868L36.7742 76.5H22.0645L26.4678 58.8868C22.4942 57.6342 19.6129 53.9197 19.6129 49.5323C19.6129 48.3693 19.8154 47.2535 20.187 46.2184L13.1203 39.1518C12.0852 39.5233 10.9695 39.7258 9.80645 39.7258C4.3905 39.7258 0 35.3353 0 29.9193C0 24.5034 4.3905 20.1129 9.80645 20.1129C15.2224 20.1129 19.6129 24.5034 19.6129 29.9193C19.6129 32.3688 18.7148 34.6086 17.23 36.3272L23.0115 42.1087C24.7301 40.6239 26.9699 39.7258 29.4194 39.7258C31.2379 39.7258 32.9409 40.2209 34.4009 41.0835L40.5835 34.9009C39.7208 33.4409 39.2258 31.7379 39.2258 29.9193C39.2258 28.1007 39.7209 26.3976 40.5836 24.9376L34.4011 18.7551C32.9411 19.6178 31.238 20.1129 29.4194 20.1129C24.0034 20.1129 19.6129 15.7224 19.6129 10.3065C19.6129 4.8905 24.0034 0.5 29.4194 0.5C34.8353 0.5 39.2258 4.8905 39.2258 10.3065ZM34.3226 49.5323C34.3226 52.2402 32.1273 54.4355 29.4194 54.4355C26.7114 54.4355 24.5161 52.2402 24.5161 49.5323C24.5161 46.8243 26.7114 44.629 29.4194 44.629C32.1273 44.629 34.3226 46.8243 34.3226 49.5323ZM49.0323 34.8226C51.7402 34.8226 53.9355 32.6273 53.9355 29.9193C53.9355 27.2114 51.7402 25.0161 49.0323 25.0161C46.3243 25.0161 44.129 27.2114 44.129 29.9193C44.129 32.6273 46.3243 34.8226 49.0323 34.8226ZM14.7097 29.9193C14.7097 32.6273 12.5144 34.8226 9.80645 34.8226C7.09847 34.8226 4.90323 32.6273 4.90323 29.9193C4.90323 27.2114 7.09847 25.0161 9.80645 25.0161C12.5144 25.0161 14.7097 27.2114 14.7097 29.9193Z"
              />
            </svg>
          </div>

          <p className="text-sm tracking-widest text-white/70 mb-4 uppercase [text-shadow:_0_2px_8px_rgb(0_0_0_/_60%)]">
            선린인터넷고등학교
          </p>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight [text-shadow:_0_4px_20px_rgb(0_0_0_/_80%)]">
            정보보호과
          </h1>

          <p className="text-lg text-white/80 mb-10 max-w-lg mx-auto [text-shadow:_0_2px_8px_rgb(0_0_0_/_60%)]">
            사이버 보안의 미래를 이끌어갈 차세대 보안 전문가를 양성합니다
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/club" className="btn-primary">
              동아리 둘러보기
            </Link>
            <Link href="/project" className="btn-secondary">
              프로젝트 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[hsl(var(--card))] border-y border-[hsl(var(--border))]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3 uppercase tracking-wider">
            About us
          </p>
          <h2 className="text-3xl font-bold mb-8">우리 학과를 소개합니다</h2>
          <div className="text-[hsl(var(--muted-foreground))] leading-relaxed space-y-4 text-center">
            <p>
              선린인터넷고등학교 <strong className="text-foreground">정보보호과</strong>는
              사이버 보안 분야의 인재를 양성하는 특성화 학과입니다. 디지털 시대에
              필수적인 정보 보호, 네트워크 보안, 시스템 해킹·방어, 웹 보안 등
              이론과 실습을 겸비한 교육으로 학생들이 보안 전문가로 성장할 수 있도록
              지원합니다.
            </p>
            <p>
              다양한 전문 동아리와 프로젝트를 통해 실전에 가까운 경험을 쌓고,
              국내외 해킹/개발 대회에 참가하며 실력을 검증합니다. 선린
              정보보호과는 함께 배우고 경쟁하며 성장하는 환경에서, 다음 세대를
              이끌 보안 인재를 만들어 갑니다.
            </p>
          </div>
          <div className="mt-10">
            <Link
              href="https://www.youtube.com/watch?v=rVE4golALoE"
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
              소개 영상 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3 uppercase tracking-wider">
            What we do
          </p>
          <h2 className="text-3xl font-bold mb-12">우리가 하는 일</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              title="보안 교육"
              description="웹 해킹, 시스템 해킹, 리버스 엔지니어링 등 다양한 보안 분야를 학습합니다"
            />
            <FeatureCard
              title="프로젝트"
              description="실제 보안 솔루션을 개발하고 대회에 참가하여 실력을 검증합니다"
            />
            <FeatureCard
              title="동아리"
              description="전문 동아리에서 심화 학습과 팀 프로젝트를 진행합니다"
            />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-[hsl(var(--border))]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            함께 성장할 준비가 되셨나요?
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">
            정보보호과의 다양한 동아리에서 보안 전문가로 성장해보세요
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/apply" className="btn-primary">
              지원하기
            </Link>
            <Link href="/club" className="btn-secondary">
              동아리 보기
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-6 text-white"
              viewBox="0 0 59 77"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M34.3226 10.3065C34.3226 13.0144 32.1273 15.2097 29.4194 15.2097C26.7114 15.2097 24.5161 13.0144 24.5161 10.3065C24.5161 7.59847 26.7114 5.40323 29.4194 5.40323C32.1273 5.40323 34.3226 7.59847 34.3226 10.3065ZM39.2258 10.3065C39.2258 12.125 38.7308 13.828 37.8681 15.2879L44.0508 21.4706C45.5107 20.6079 47.2137 20.1129 49.0323 20.1129C54.4482 20.1129 58.8387 24.5034 58.8387 29.9193C58.8387 35.3353 54.4482 39.7258 49.0323 39.7258C47.2136 39.7258 45.5106 39.2307 44.0506 38.368L37.868 44.5506C38.7307 46.0106 39.2258 47.7136 39.2258 49.5323C39.2258 53.9197 36.3445 57.6342 32.3709 58.8868L36.7742 76.5H22.0645L26.4678 58.8868C22.4942 57.6342 19.6129 53.9197 19.6129 49.5323C19.6129 48.3693 19.8154 47.2535 20.187 46.2184L13.1203 39.1518C12.0852 39.5233 10.9695 39.7258 9.80645 39.7258C4.3905 39.7258 0 35.3353 0 29.9193C0 24.5034 4.3905 20.1129 9.80645 20.1129C15.2224 20.1129 19.6129 24.5034 19.6129 29.9193C19.6129 32.3688 18.7148 34.6086 17.23 36.3272L23.0115 42.1087C24.7301 40.6239 26.9699 39.7258 29.4194 39.7258C31.2379 39.7258 32.9409 40.2209 34.4009 41.0835L40.5835 34.9009C39.7208 33.4409 39.2258 31.7379 39.2258 29.9193C39.2258 28.1007 39.7209 26.3976 40.5836 24.9376L34.4011 18.7551C32.9411 19.6178 31.238 20.1129 29.4194 20.1129C24.0034 20.1129 19.6129 15.7224 19.6129 10.3065C19.6129 4.8905 24.0034 0.5 29.4194 0.5C34.8353 0.5 39.2258 4.8905 39.2258 10.3065ZM34.3226 49.5323C34.3226 52.2402 32.1273 54.4355 29.4194 54.4355C26.7114 54.4355 24.5161 52.2402 24.5161 49.5323C24.5161 46.8243 26.7114 44.629 29.4194 44.629C32.1273 44.629 34.3226 46.8243 34.3226 49.5323ZM49.0323 34.8226C51.7402 34.8226 53.9355 32.6273 53.9355 29.9193C53.9355 27.2114 51.7402 25.0161 49.0323 25.0161C46.3243 25.0161 44.129 27.2114 44.129 29.9193C44.129 32.6273 46.3243 34.8226 49.0323 34.8226ZM14.7097 29.9193C14.7097 32.6273 12.5144 34.8226 9.80645 34.8226C7.09847 34.8226 4.90323 32.6273 4.90323 29.9193C4.90323 27.2114 7.09847 25.0161 9.80645 25.0161C12.5144 25.0161 14.7097 27.2114 14.7097 29.9193Z"
              />
            </svg>
            <span className="text-sm font-medium">정보보호과</span>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            © {new Date().getFullYear()} 선린인터넷고등학교 정보보호과
          </p>
        </div>
      </footer>
    </>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
