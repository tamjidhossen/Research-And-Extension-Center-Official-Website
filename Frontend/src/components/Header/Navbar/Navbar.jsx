// src/components/Header/Navbar/Navbar.jsx
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ModeToggle from "@/components/ui/mode-toggle";
import { Menu, BookOpen, FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };
  
  return (
    <nav className="sticky top-0 z-30 w-full bg-white/80 dark:bg-green-950/80 backdrop-blur-lg border-b border-emerald-100/50 dark:border-emerald-900/50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">

            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                Research & Extension Center
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400">
                Jatiya Kabi Kazi Nazrul Islam University
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                    : "hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
                }`
              }
            >
              <BookOpen size={18} />
              <span>Home</span>
            </NavLink>
            
            <NavLink
              to="/registration"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                    : "hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
                }`
              }
            >
              <FileText size={18} />
              <span>Registration</span>
            </NavLink>
            
            <NavLink
              to="/announcements"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                    : "hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
                }`
              }
            >
              <Bell size={18} />
              <span>Announcements</span>
            </NavLink>
            
            <div className="ml-2">
              <ModeToggle />
            </div>
          </div>
          
          <div className="flex md:hidden items-center gap-2">
            <ModeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-emerald-700 dark:text-emerald-400">
                    Research & Extension Center
                  </SheetTitle>
                  <SheetDescription>
                    JKKNIU
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4">
                  <NavLink 
                    to="/" 
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `p-3 rounded-md flex items-center gap-3 transition-colors ${
                        isActive 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" 
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-emerald-900/30"
                      }`
                    }
                  >
                    <BookOpen size={20} />
                    <span>Home</span>
                  </NavLink>
                  
                  <NavLink 
                    to="/registration" 
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `p-3 rounded-md flex items-center gap-3 transition-colors ${
                        isActive 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" 
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-emerald-900/30"
                      }`
                    }
                  >
                    <FileText size={20} />
                    <span>Registration</span>
                  </NavLink>
                  
                  <NavLink 
                    to="/announcements" 
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `p-3 rounded-md flex items-center gap-3 transition-colors ${
                        isActive 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" 
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-emerald-900/30"
                      }`
                    }
                  >
                    <Bell size={20} />
                    <span>Announcements</span>
                  </NavLink>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
