import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atelier Noir — Private Cinema, Precisely Made',
  description:
    'Atelier Noir designs and builds cinematic home theatres with architectural precision, immersive sound, and perfect picture.',
  icons: {
    icon: 'favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
