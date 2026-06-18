import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'EcoTrack – AI-Powered Carbon Footprint Tracker',
  description: 'Track, reduce, and offset your carbon footprint with AI-powered insights. Join millions making the planet greener.',
  keywords: 'carbon footprint, sustainability, eco tracker, climate change, green living',
  authors: [{ name: 'EcoTrack' }],
  openGraph: {
    title: 'EcoTrack – AI Carbon Footprint Platform',
    description: 'AI-powered sustainability insights to reduce your carbon footprint.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
