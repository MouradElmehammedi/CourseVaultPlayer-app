import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import "./learning-platform.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LearnVault — Private course workspace",
    template: "%s · LearnVault",
  },
  description:
    "A private, offline-first workspace for studying downloaded video and audio courses.",
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
      className={`${plexSans.variable} ${barlowCondensed.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k=["learnvault:v1:progress","coursevault:v1:progress"];var r=null;for(var i=0;i<k.length;i++){r=localStorage.getItem(k[i]);if(r)break}var s=r?JSON.parse(r).settings:null;var p=s&&s.theme?s.theme:"light";var t=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light");document.documentElement.style.colorScheme=t==="dark"?"dark":"light"}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
