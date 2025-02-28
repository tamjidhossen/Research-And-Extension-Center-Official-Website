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
import { Menu } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };
  return (
    <nav className="p-4 bg-background/50 sticky top-0 backdrop-blur border-b z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/">
          <div className="text-lg font-bold">CSE Alumni Reunion 2025</div>
        </Link>
        <div className="hidden md:flex space-x-4 items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hover:scale-105 hover:font-semibold duration-100 ${
                isActive ? "text-green-400" : ""
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/registration"
            className={({ isActive }) =>
              `hover:scale-105 hover:font-semibold duration-100 ${
                isActive ? "text-green-400" : ""
              }`
            }
          >
            Registration
          </NavLink>
          <NavLink
            to="/announcements"
            className={({ isActive }) =>
              `hover:scale-105 hover:font-semibold duration-100 ${
                isActive ? "text-green-400" : ""
              }`
            }
          >
            Announcements
          </NavLink>
          <ModeToggle />
        </div>
        <div className="md:hidden">
          <span className="mx-2">
            <ModeToggle />
          </span>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
              <Menu />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="font-bold my-4">
                  CSE Alumni Reunion 2025
                </SheetTitle>
                <SheetDescription>
                  <div className="flex flex-col gap-6">
                    <NavLink to="/" onClick={handleLinkClick}>
                      Home
                    </NavLink>
                    <NavLink to="/registration" onClick={handleLinkClick}>
                      Registration
                    </NavLink>
                    <NavLink to="/announcements" onClick={handleLinkClick}>
                      Announcements
                    </NavLink>
                  </div>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
