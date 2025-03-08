import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  LogOut,
  FileText,
  BellRing,
  Settings,
  BookOpen,
  MenuIcon,
  X,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import ProposalsDashboard from "./ProposalDashboard";
import NoticesDashboard from "./NoticesDashboard";
import OverviewDashboard from "./OverviewDashboard";
import InvoiceManagement from "./InvoiceManagement";
import AccountsDashboard from "./AccountsDashboard";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem("dashboardView") || "statistics";
  });
  const [adminName, setAdminName] = useState("Admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState ? savedState === "true" : false;
  });

  useEffect(() => {
    // Get admin data from localStorage
    const adminData = JSON.parse(localStorage.getItem("adminData"));
    if (adminData && adminData.name) {
      setAdminName(adminData.name);
    }

    // Save active view to localStorage
    localStorage.setItem("dashboardView", activeView);
  }, [activeView]);

  const handleLogout = () => {
    Cookies.remove("adminToken");
    localStorage.removeItem("adminData");
    localStorage.removeItem("dashboardView");
    navigate("/admin/login");
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", newState.toString());
  };

  const renderDashboard = () => {
    switch (activeView) {
      case "overview":
        return <OverviewDashboard />;
      case "proposals":
        return <ProposalsDashboard />;
      case "notices":
        return <NoticesDashboard />;
      case "invoices":
        return <InvoiceManagement />;
      case "accounts":
        return <AccountsDashboard />;
      default:
        return <OverviewDashboard />;
    }
  };

  const NavItem = ({ icon, label, value }) => (
    <button
      onClick={() => handleViewChange(value)}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-md transition-colors",
        activeView === value
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-emerald-900/30",
        sidebarCollapsed && "justify-center px-2"
      )}
      title={sidebarCollapsed ? label : undefined}
    >
      {icon}
      {!sidebarCollapsed && <span>{label}</span>}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[240px] sm:w-[300px] p-0"
                  hideCloseButton={true}
                >
                  <div className="py-6 px-4">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold">Dashboard</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-full hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <nav className="space-y-2">
                      <NavItem
                        icon={<PieChart className="h-5 w-5" />}
                        label="Overview"
                        value="statistics"
                      />
                      <NavItem
                        icon={<FileText className="h-5 w-5" />}
                        label="Proposals"
                        value="proposals"
                      />
                      <NavItem
                        icon={<BellRing className="h-5 w-5" />}
                        label="Notices"
                        value="notices"
                      />
                      <NavItem
                        icon={<Receipt className="h-5 w-5" />}
                        label="Invoices"
                        value="invoices"
                      />
                      <NavItem
                        icon={<Users className="h-5 w-5" />}
                        label="Accounts"
                        value="accounts"
                      />
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{adminName}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden lg:flex flex-col h-full border-r transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
        >
          <div className="flex flex-col flex-1 p-4">
            <div
              className={cn(
                "flex items-center mb-6",
                sidebarCollapsed ? "justify-center" : "justify-between"
              )}
            >
              {!sidebarCollapsed && (
                <h2 className="text-lg font-semibold">Dashboard</h2>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100"
                onClick={toggleSidebar}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
            <nav className="space-y-2">
              <NavItem
                icon={<PieChart className="h-5 w-5" />}
                label="Overview"
                value="statistics"
              />
              <NavItem
                icon={<FileText className="h-5 w-5" />}
                label="Proposals"
                value="proposals"
              />
              <NavItem
                icon={<BellRing className="h-5 w-5" />}
                label="Notices"
                value="notices"
              />
              <NavItem
                icon={<Receipt className="h-5 w-5" />}
                label="Invoices"
                value="invoices"
              />
              <NavItem
                icon={<Users className="h-5 w-5" />}
                label="Accounts"
                value="accounts"
              />
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{renderDashboard()}</main>
      </div>
    </div>
  );
}
