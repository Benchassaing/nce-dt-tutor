import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: "NCE Design & Technology Virtual Tutor",
  description: "AI-powered learning platform for Mauritius NCE Design & Technology examinations",
  keywords: ["NCE", "Design & Technology", "Mauritius", "Education", "AI Tutor", "Exam Preparation"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}