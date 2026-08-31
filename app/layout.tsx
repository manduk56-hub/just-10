import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'JUST 10. — 딱 10초, 캐낼 수 있나요?',
  description: '다이아몬드 곡괭이로 흑요석을 캐며 도전하는 10초 타이밍 게임. 스페이스바로 시작하고 10초에 멈춰보세요.',
  icons: { icon: '/textures/diamond_pickaxe.png' },
  openGraph: { title: 'JUST 10. — 딱 10초, 캐낼 수 있나요?', description: '스페이스바로 도전하는 흑요석 10초 챌린지.', images: [{ url: '/og.png', width: 1672, height: 941 }], locale: 'ko_KR', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'JUST 10. — 딱 10초, 캐낼 수 있나요?', description: '스페이스바로 도전하는 흑요석 10초 챌린지.', images: ['/og.png'] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body></html>;
}
