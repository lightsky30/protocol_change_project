import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "You found this place.",
  description: "A one-message-at-a-time digital note box for a hidden campus corner."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#11100e"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
