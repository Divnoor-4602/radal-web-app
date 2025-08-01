import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { dark } from "@clerk/themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Radal",
  description:
    "Fine-tune open-source small language models using a drag-and-drop canvas and AI-assisted fine-tuning.",
  icons: {
    icon: "/radal-logo.png",
  },
  applicationName: "Radal",
  keywords: [
    "AI",
    "machine learning",
    "fine-tuning",
    "language models",
    "open source",
    "drag and drop",
    "canvas",
    "LLM",
    "model training",
    "artificial intelligence",
  ],
  openGraph: {
    title: "Radal",
    description:
      "Fine-tune open-source small language models using a drag-and-drop canvas and AI-assisted fine-tuning.",
    url: "https://app.radal.ai",
    siteName: "Radal",
    images: [
      {
        url: "https://app.radal.ai/images/social-preview-link.png",
        width: 1200,
        height: 630,
        alt: "Radal - AI Model Fine-tuning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Radal",
    description:
      "Fine-tune open-source small language models using a drag-and-drop canvas and AI-assisted fine-tuning.",
    images: ["https://app.radal.ai/images/social-preview-link.png"],
    creator: "@divandcode",
    site: "@divandcode",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="dark"
        >
          <Toaster richColors theme="dark" />
          <ClerkProvider
            afterSignOutUrl="/sign-in"
            appearance={{
              baseTheme: dark,
            }}
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
