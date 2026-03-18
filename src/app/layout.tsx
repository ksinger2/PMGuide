import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ProfileProvider } from "@/stores/profile-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PMGuide — Your PM Career Companion",
  description:
    "AI-powered career guidance for product managers. Build your profile, refine your resume, and level up your PM career.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ProfileProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-60 pb-20 lg:pb-0">
              <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </main>
          </div>
          <MobileNav />
        </ProfileProvider>
      </body>
    </html>
  );
}
