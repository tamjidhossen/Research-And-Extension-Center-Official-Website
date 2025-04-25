import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import Cookies from "js-cookie";

export default function NoticeManagerLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/api/admin/noticer/login", credentials);

      if (response.data.success) {
        // Store token in cookie
        Cookies.set("noticeManagerToken", response.data.token, { expires: 1 }); // expires in 1 day

        // Store admin noticer data in localStorage
        localStorage.setItem(
          "noticeManagerData",
          JSON.stringify({
            name: response.data.adminNoticer.name,
            email: response.data.adminNoticer.email,
            id: response.data.adminNoticer.id,
          })
        );

        toast({
          title: "Success",
          description: "Logged in successfully",
        });

        navigate("/notice-manager/dashboard");
      }
    } catch (error) {
      // console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 space-y-6 border rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center">
            Notice Manager Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
      <Toaster />
    </>
  );
}
