import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  BellRing,
  UserCircle,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import api from "@/lib/api";

const EXCLUDED_EMAILS = ["tamjidhossen420@gmail.com", "nabeelahsanofficial@gmail.com"];

export default function AccountsDashboard() {
  const [admins, setAdmins] = useState([]);
  const [noticeManagers, setNoticeManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accountType, setAccountType] = useState("admin"); // "admin" or "noticeManager"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { toast } = useToast();

  // Fetch all accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      // Fetch admins
      const adminResponse = await api.get("/api/admin/all");
      if (adminResponse.data.success) {
        setAdmins(filterExcludedAccounts(adminResponse.data.admins));
      }

      // Fetch notice managers
      const noticeManagersResponse = await api.get("/api/admin/noticer/all");
      if (noticeManagersResponse.data.success) {
        setNoticeManagers(filterExcludedAccounts(noticeManagersResponse.data.admins));
      }
    } catch (error) {
      // console.error("Error fetching accounts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch accounts",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

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

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required",
      });
      return;
    }

    // Validate name length
    if (formData.name.length < 3) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Name must be at least 3 characters long",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }

    // Validate password requirements
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      const passwordErrors = [];

      if (passwordValidation.errors.length)
        passwordErrors.push("At least 8 characters");
      if (passwordValidation.errors.upperCase)
        passwordErrors.push("One uppercase letter");
      if (passwordValidation.errors.lowerCase)
        passwordErrors.push("One lowercase letter");
      if (passwordValidation.errors.numbers) passwordErrors.push("One number");
      if (passwordValidation.errors.specialChar)
        passwordErrors.push("One special character (!@#$%^&*)");

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

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    try {
      let response;
      const requestData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      if (accountType === "admin") {
        response = await api.post("/api/admin/register", requestData);
      } else {
        response = await api.post("/api/admin/noticer/register", requestData);
      }

      if (response.data.success) {
        toast({
          title: "Success",
          description: `${
            accountType === "admin" ? "Admin" : "Notice Manager"
          } created successfully`,
        });

        // Refresh the accounts list
        fetchAccounts();

        // Close the dialog and reset form
        setIsDialogOpen(false);
        resetFormData();
      }
    } catch (error) {
      // console.error("Error creating account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || `Failed to create ${accountType}`,
      });
    }
  };

  const filterExcludedAccounts = (accounts) => {
    return accounts.filter(account => 
      !EXCLUDED_EMAILS.includes(account.email.toLowerCase())
    );
  };

  const handleDeleteAccount = async (id, type) => {
    try {
      if (type === "admin") {
        await api.delete(`/api/admin/delete/${id}`);
        setAdmins(admins.filter((admin) => admin._id !== id));
      } else {
        await api.delete(`/api/admin/noticer/${id}`);
        setNoticeManagers(
          noticeManagers.filter((manager) => manager._id !== id)
        );
      }

      toast({
        title: "Success",
        description: `${
          type === "admin" ? "Admin" : "Notice Manager"
        } deleted successfully`,
      });
    } catch (error) {
      // console.error("Error deleting account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || `Failed to delete ${type}`,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">
            Accounts Management
          </h1>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetFormData();
            }}
          >
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Account</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new account.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Account Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="accountType"
                        checked={accountType === "admin"}
                        onChange={() => setAccountType("admin")}
                        className="h-4 w-4"
                      />
                      <span>Admin</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="accountType"
                        checked={accountType === "noticeManager"}
                        onChange={() => setAccountType("noticeManager")}
                        className="h-4 w-4"
                      />
                      <span>Notice Manager</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Password
                  </label>
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

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Confirm Password
                  </label>
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetFormData();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="admins">
          <TabsList className="mb-6">
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Admins
            </TabsTrigger>
            <TabsTrigger
              value="noticeManagers"
              className="flex items-center gap-2"
            >
              <BellRing className="h-4 w-4" />
              Notice Managers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admins">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {admins.map((admin) => (
                <Card key={admin._id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-emerald-500" />
                        <CardTitle className="text-xl font-semibold">
                          {admin.name}
                        </CardTitle>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Admin Account
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this admin
                              account? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex justify-end gap-2 mt-4">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteAccount(admin._id, "admin")
                              }
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Email:{" "}
                        </span>
                        <span className="text-sm">{admin.email}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Role:{" "}
                        </span>
                        <span className="text-sm">Admin</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {admins.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">
                    No admin accounts found
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="noticeManagers">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {noticeManagers.map((manager) => (
                <Card key={manager._id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <BellRing className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-xl font-semibold">
                          {manager.name}
                        </CardTitle>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Notice Manager Account
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this notice
                              manager account? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex justify-end gap-2 mt-4">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteAccount(
                                  manager._id,
                                  "noticeManager"
                                )
                              }
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Email:{" "}
                        </span>
                        <span className="text-sm">{manager.email}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Role:{" "}
                        </span>
                        <span className="text-sm">Notice Manager</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {noticeManagers.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">
                    No notice manager accounts found
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </>
  );
}
