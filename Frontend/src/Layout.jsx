// To keep the header and footer same for every page.
// Outlet is used to render the child routes.
// Outlet is a placeholder for the child routes to render.

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
      {/* Add the light beam and grid effects */}
      <div className="fixed left-0 top-0 -z-10 h-full w-full">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-40%,rgba(255,255,255,0.15),rgba(255,255,255,0))]" />
        {/* Background Grid Pattern */}
        <div
          className="fixed inset-0 z-0 opacity-[0.15]"
          style={{
            backgroundImage: `
linear-gradient(to right, #8882 1px, transparent 1px),
          linear-gradient(to bottom, #8882 1px, transparent 1px)
      `,
            backgroundSize: "6rem 6rem",
          }}
        />
      </div>
      <div className="flex flex-col min-h-screen">
        {" "}
        {/* Added flex container */}
        <Navbar />
        <main className="flex-grow">
          {" "}
          {/* Added flex-grow to main */}
          <Outlet />
        </main>
        <Toaster />
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default Layout;