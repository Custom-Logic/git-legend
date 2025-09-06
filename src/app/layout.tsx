import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { NavBar } from "@/components/navigation/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitLegend - Unfold Your Code's Story",
  description: "Transform your GitHub repository into a compelling visual narrative. Discover the story behind every commit, contributor, and milestone.",
  keywords: ["GitLegend", "GitHub", "git history", "code analysis", "AI", "visualization", "repository"],
  authors: [{ name: "GitLegend Team" }],
  openGraph: {
    title: "GitLegend - Unfold Your Code's Story",
    description: "Transform your GitHub repository into a compelling visual narrative.",
    url: "https://gitlegend.com",
    siteName: "GitLegend",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitLegend - Unfold Your Code's Story",
    description: "Transform your GitHub repository into a compelling visual narrative.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <NavBar />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
