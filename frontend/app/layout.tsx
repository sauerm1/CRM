import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";

// const inter = Inter({
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Gym CRM - Member Management",
  description: "Admin tool for managing gym/wellness club memberships",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
