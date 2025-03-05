import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

export default function InvoiceSubmission() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [reviewer, setReviewer] = useState(null);
  const [fiscalYear, setFiscalYear] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState(null);

  // Get token from URL params
  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token in localStorage
      localStorage.setItem("invoiceToken", token);
      verifyToken(token);
    } else {
      // Check if token exists in localStorage
      const storedToken = localStorage.getItem("invoiceToken");
      if (storedToken) {
        verifyToken(storedToken);
      } else {
        setLoading(false);
        setAuthorized(false);
      }
    }
  }, [searchParams]);

  const verifyToken = async (token) => {
    try {
      const response = await api.post(
        "/api/reviewer/research-proposal/submit/invoice/verify",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        setAuthorized(true);
        if(response.data.reviewer) {
          setReviewer(response.data.reviewer);
        }
        if(response.data.fiscal_year) {
          setFiscalYear(response.data.fiscal_year);
        }
      } else {
        setAuthorized(false);
        toast({
          title: "Unauthorized",
          description: "Invalid or expired token",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Token verification error:", error);
      setAuthorized(false);
      toast({
        title: "Authentication Failed",
        description:
          error.response?.data?.message || "Could not verify your credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File too large",
        description: "File size should not exceed 5MB",
        variant: "destructive",
      });
      return;
    }

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF files only",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    toast({
      title: "File selected",
      description: "Signed invoice has been selected",
    });
  };

  // const handleDownloadInvoice = () => {
  //   if (!invoiceUrl) {
  //     toast({
  //       title: "Download Failed",
  //       description: "Invoice document is not available",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   // Create full URL for download
  //   const baseUrl = import.meta.env.VITE_API_URL || "";
  //   const serverRoot = baseUrl.replace(/\/v1$/, "");
  //   const fileUrl = `${serverRoot}/${invoiceUrl}`;

  //   // Open in new tab
  //   window.open(fileUrl, "_blank");
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        title: "Missing file",
        description: "Please upload your signed invoice",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create form data for submission
      const formData = new FormData();
      formData.append("invoice", selectedFile);

      const token = localStorage.getItem("invoiceToken");

      const response = await api.post(
        "/api/reviewer/research-proposal/submit/invoice",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        toast({
          title: "Submission Successful",
          description: "Your signed invoice has been submitted successfully",
        });
        setAlreadySubmitted(true);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description:
          error.response?.data?.message ||
          "An error occurred while submitting your invoice",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="mt-4 text-xl">Verifying your credentials...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-red-200 dark:border-red-800 max-w-lg mx-auto">
          <CardHeader className="bg-red-50 dark:bg-red-950/30">
            <CardTitle className="text-red-800 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              You do not have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 dark:text-gray-300">
              To submit an invoice, you need a valid invitation link.
              Please check your email for an invitation or contact the Research
              and Extension Center.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-green-200 dark:border-green-800 max-w-lg mx-auto">
          <CardHeader className="bg-green-50 dark:bg-green-950/30">
            <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Invoice Submitted
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Your signed invoice has been submitted successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 dark:text-gray-300">
              Thank you for submitting your signed invoice. You can now close this window.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-emerald-200 dark:border-emerald-800 max-w-2xl mx-auto">
        <CardHeader className="bg-emerald-50 dark:bg-emerald-900/20">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-6 w-6 text-emerald-600" />
            <CardTitle>Invoice Submission</CardTitle>
          </div>
          <CardDescription>
            Submit your signed invoice for review
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Reviewer Info */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              Reviewer Information
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Name:</p>
                <p className="font-medium">{reviewer?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email:</p>
                <p className="font-medium">{reviewer?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fiscal Year:</p>
                <p className="font-medium">{fiscalYear}</p>
              </div>
            </div>
          </div>

          {/* Download Invoice Section */}
          {/* <div>
            <h3 className="font-medium mb-3">Step 1: Download Invoice</h3>
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 mb-3">
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                Please download the invoice, print it, sign it, and then scan it as a PDF.
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleDownloadInvoice}
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
          </div> */}

          <Separator />

          {/* Upload Section */}
          <form onSubmit={handleSubmit}>
            <div>
              <h3 className="font-medium mb-3">Step 2: Upload Signed Invoice</h3>
              <div className="grid gap-4 mb-4">
                <input
                  type="file"
                  id="signed-invoice"
                  className="hidden"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                <Label
                  htmlFor="signed-invoice"
                  className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2 mx-auto" />
                    <p className="text-sm font-medium">
                      Click to select your signed invoice (PDF)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max file size: 5MB
                    </p>
                  </div>
                </Label>
                {selectedFile && (
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {selectedFile.name}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={submitting || !selectedFile}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Signed Invoice"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
