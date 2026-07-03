import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LearnVault Player",
  description: "A private local course media player with browser-saved progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k=["learnvault:v1:progress","coursevault:v1:progress"];var r=null;for(var i=0;i<k.length;i++){r=localStorage.getItem(k[i]);if(r)break}var s=r?JSON.parse(r).settings:null;var p=s&&s.theme?s.theme:"light";var t=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light");document.documentElement.style.colorScheme=t==="dark"?"dark":"light"}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
