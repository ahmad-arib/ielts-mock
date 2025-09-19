import type { Metadata } from "next";
import "./globals.css";

const geistSans = {
  variable: "font-geist-sans",
} as const;

const geistMono = {
  variable: "font-geist-mono",
} as const;

export const metadata: Metadata = {
  title: "IELTS Try Out",
  description: "Practise IELTS Listening & Reading in real time for less than 5% of the official exam fee.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
