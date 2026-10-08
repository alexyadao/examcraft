import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ExamCraft Studio | Technical Exam & Assessment Engine',
  description: 'Create custom test question banks, run timed technical assessments, and inspect real-time evaluation data.',
  openGraph: {
    title: 'ExamCraft Studio | Technical Exam & Assessment Engine',
    description: 'Create custom test question banks, run timed technical assessments, and inspect real-time evaluation data.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExamCraft Studio | Technical Exam & Assessment Engine',
    description: 'Create custom test question banks, run timed technical assessments, and inspect real-time evaluation data.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
