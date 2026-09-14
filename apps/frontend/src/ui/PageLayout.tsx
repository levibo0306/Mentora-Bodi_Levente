import type { ReactNode } from "react";

type PageLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: "wide" | "medium";
};

export function PageLayout({
  title,
  subtitle,
  children,
  width = "wide",
}: PageLayoutProps) {
  return (
    <main className="app-page">
      <div className={`app-page-content app-page-content--${width}`}>
        <header className="page-heading">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </header>
        {children}
      </div>
    </main>
  );
}
