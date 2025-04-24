import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import NoticesDashboard from "../Admin/NoticesDashboard";
import Cookies from "js-cookie";
import api from "../../lib/api"

export default function NoticeManagerDashboard() {
  const navigate = useNavigate();
  const [noticeManagerName, setNoticeManagerName] = useState("Notice Manager");

  useEffect(() => {
    // Get notice manager data from localStorage
    const noticeManagerData = JSON.parse(localStorage.getItem("noticeManagerData"));
    if (noticeManagerData && noticeManagerData.name) {
      setNoticeManagerName(noticeManagerData.name);
    }
    
    // Add request interceptor to include token
    const originalRequest = api.interceptors.request.use(
      (config) => {
        const token = Cookies.get("noticeManagerToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    return () => {
      // Remove interceptor when unmounting
      api.interceptors.request.eject(originalRequest);
    };
  }, []);

  const handleLogout = () => {
    Cookies.remove("noticeManagerToken");
    localStorage.removeItem("noticeManagerData");
    navigate("/notice-manager/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold">Notice Manager Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{noticeManagerName}</span>
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

      <main className="flex-1 p-6">
        <NoticesDashboard />
      </main>
    </div>
  );
}