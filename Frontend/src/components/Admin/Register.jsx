import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/authConfig";
import { Toaster } from "@/components/ui/toaster";
import { Eye, EyeOff } from "lucide-react";

export default function AdminRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    return {
      isValid:
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar,
      errors: {
        length: password.length < minLength,
        upperCase: !hasUpperCase,
        lowerCase: !hasLowerCase,
        numbers: !hasNumbers,
        specialChar: !hasSpecialChar,
      },
    };
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check password requirements first
    const passwordValidation = validatePassword(formData.password);
    const passwordErrors = [];

    if (passwordValidation.errors.length) {
      passwordErrors.push("At least 8 characters");
    }
    if (passwordValidation.errors.upperCase) {
      passwordErrors.push("One uppercase letter");
    }
    if (passwordValidation.errors.lowerCase) {
      passwordErrors.push("One lowercase letter");
    }
    if (passwordValidation.errors.numbers) {
      passwordErrors.push("One number");
    }
    if (passwordValidation.errors.specialChar) {
      passwordErrors.push("One special character (!@#$%^&*)");
    }

    // Show all password requirements that aren't met
    if (passwordErrors.length > 0) {
      toast({
        variant: "destructive",
        title: "Password Requirements",
        description: (
          <ul className="list-disc list-inside">
            {passwordErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            // Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        navigate("/admin/login");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description:
          error.response?.data?.message ||
          "An error occurred during registration",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 space-y-6 border rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center">Admin Registration</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>
          <div className="text-center text-sm">
            <Link to="/admin/login" className="text-primary hover:underline">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
