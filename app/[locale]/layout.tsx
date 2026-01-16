import LanguageSwitcher from "../components/LanguageSwitcher";

export default function LocaleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <LanguageSwitcher />
        {children}
      </body>
    </html>
  );
}