import "./globals.css";
import CoreBadge from "./components/CoreBadge";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CoreBadge />
        {children}
      </body>
    </html>
  );
}