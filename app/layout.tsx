import "./globals.css";
import Image from "next/image";

export const metadata = {
  title: "CORE",
  description: "CORE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Global CORE mark (always visible) */}
        <div className="fixed right-4 top-4 z-50">
          <Image
            src="/core-mark.png"
            alt="CORE"
            width={44}
            height={44}
            priority
            className="rounded-xl shadow-sm"
          />
        </div>

        {children}
      </body>
    </html>
  );
}