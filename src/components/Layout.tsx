import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-md mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
