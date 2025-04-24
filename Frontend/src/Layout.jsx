import Footer from "./components/Footer/Footer";
import Navbar from "./components/Header/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from "./components/ScrollToTop";

function Layout() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ScrollToTop />
      {/* Background effects */}
      <div className="fixed left-0 top-0 -z-10 h-full w-full overflow-hidden">
        {/* Light beam gradient effect - different for dark/light modes */}
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,255,214,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,130,100,0.3),rgba(0,30,20,0))]" />
        
        {/* Accent blob for light mode */}
        <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl dark:hidden" />
        <div className="absolute right-20 -bottom-32 h-96 w-96 rounded-full bg-emerald-100/20 blur-3xl dark:hidden" />
        
        {/* Accent blob for dark mode */}
        <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-emerald-900/30 blur-3xl hidden dark:block" />
        <div className="absolute right-20 -bottom-32 h-96 w-96 rounded-full bg-emerald-800/20 blur-3xl hidden dark:block" />
        
        {/* Background Grid Pattern */}
        <div
          className="fixed inset-0 z-0 opacity-[0.015] dark:opacity-[0.1]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #22c55e22 1px, transparent 1px),
              linear-gradient(to bottom, #22c55e22 1px, transparent 1px)
            `,
            backgroundSize: "4rem 4rem",
          }}
        />
      </div>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-7xl">
          <Outlet />
        </main>
        <Toaster />
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default Layout;
