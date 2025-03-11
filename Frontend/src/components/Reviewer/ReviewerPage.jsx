import React, { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Download,
  Upload,
  FileText,
  Loader2,
  User,
  CheckCircle,
  X,
  ClipboardList,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import Cookies from "js-cookie";

export default function ReviewerPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [reviewer, setReviewer] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [selectedMarksheet, setSelectedMarksheet] = useState(null);
  const [totalMark, setTotalMark] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [marksheetUrl, setMarksheetUrl] = useState(null);
  const [reviewFormUrl, setReviewFormUrl] = useState(null);
  const [invoiceTemplateUrl, setInvoiceTemplateUrl] = useState(null);
  const [selectedReviewForm, setSelectedReviewForm] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Get token from URL params
  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token in localStorage
      Cookies.set("reviewerToken", token, { secure: true, sameSite: "strict" });
      verifyToken(token);
    } else {
      // Check if token exists in localStorage
      const storedToken = Cookies.get("reviewerToken");
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
      console.log("Attempting to verify reviewer token");

      if (!token) {
        console.error("No reviewer token available");
        setAuthorized(false);
        return;
      }

      const response = await api.post(
        "/api/reviewer/research-proposal/review/verify",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        setAuthorized(true);
        setProposal(response.data.proposal);
        if (response.data.proposal_mark_sheet) {
          const baseUrl = import.meta.env.VITE_API_URL || "";
          const serverRoot = baseUrl.replace(/\/v1$/, "");
          setMarksheetUrl(`${serverRoot}/${response.data.proposal_mark_sheet}`);
        }
        if (response.data.review_form_url) {
          const baseUrl = import.meta.env.VITE_API_URL || "";
          const serverRoot = baseUrl.replace(/\/v1$/, "");
          setReviewFormUrl(`${serverRoot}/${response.data.review_form_url}`);
        }
        if (response.data.invoice_url) {
          const baseUrl = import.meta.env.VITE_API_URL || "";
          const serverRoot = baseUrl.replace(/\/v1$/, "");
          setInvoiceTemplateUrl(`${serverRoot}/${response.data.invoice_url}`);
        }

        if (response.data.reviewer) {
          setReviewer(response.data.reviewer);
        } else {
          // Fallback if reviewer data is not available
          setReviewer({
            name: "Reviewer",
            email: "reviewer@example.com",
          });
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

  const handleFileChange = (fileType, e) => {
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

    if (fileType === "marksheet") {
      setSelectedMarksheet(file);
      toast({
        title: "File selected",
        description: "Marking sheet has been selected",
      });
    } else if (fileType === "review") {
      setSelectedReviewForm(file);
      toast({
        title: "File selected",
        description: "Proposal review form has been selected",
      });
    } else if (fileType === "invoice") {
      setSelectedInvoice(file);
      toast({
        title: "File selected",
        description: "Invoice has been selected",
      });
    }
  };

  const handleDownloadProposal = () => {
    if (!proposal || !proposal.pdf_url_part_B) {
      toast({
        title: "Download Failed",
        description: "Proposal document is not available",
        variant: "destructive",
      });
      return;
    }

    // Create full URL for download
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const serverRoot = baseUrl.replace(/\/v1$/, "");
    const fileUrl = `${serverRoot}/${proposal.pdf_url_part_B}`;

    // Open in new tab
    window.open(fileUrl, "_blank");
  };

  const handleDownloadMarkingSheet = () => {
    if (!marksheetUrl) {
      toast({
        title: "Download Failed",
        description: "Marking sheet template is not available",
        variant: "destructive",
      });
      return;
    }

    // Open in new tab
    window.open(marksheetUrl, "_blank");
  };

  const handleDownloadReviewForm = () => {
    if (!reviewFormUrl) {
      toast({
        title: "Download Failed",
        description: "Review form template is not available",
        variant: "destructive",
      });
      return;
    }
    window.open(reviewFormUrl, "_blank");
  };

  const handleDownloadInvoiceTemplate = () => {
    if (!invoiceTemplateUrl) {
      toast({
        title: "Download Failed",
        description: "Invoice template is not available",
        variant: "destructive",
      });
      return;
    }
    window.open(invoiceTemplateUrl, "_blank");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMarksheet) {
      toast({
        title: "Missing file",
        description: "Please upload your completed marking sheet",
        variant: "destructive",
      });
      return;
    }

    if (!totalMark || isNaN(parseFloat(totalMark))) {
      toast({
        title: "Invalid mark",
        description: "Please enter a valid numeric total mark",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create form data for submission
      const formData = new FormData();
      formData.append("marksheet", selectedMarksheet);
      if (selectedReviewForm) {
        formData.append("evaluation_sheet", selectedReviewForm);
      }
      if (selectedInvoice) {
        formData.append("invoice", selectedInvoice);
      }
      formData.append("total_mark", totalMark);
      formData.append("fiscal_year", proposal.fiscal_year)

      // const token = localStorage.getItem("reviewerToken");

      const response = await api.post(
        "/api/reviewer/research-proposal/submit/mark",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.success) {
        toast({
          title: "Submission Successful",
          description: "Your review has been submitted successfully",
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
          "An error occurred while submitting your review",
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
              To review a research proposal, you need a valid invitation link.
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
              Review Submitted
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Thank you for your review
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 dark:text-gray-300">
              Your review has been submitted successfully. Thank you for your
              time and expertise.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm">
          <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20">
            <CardTitle className="text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Research Proposal Review
            </CardTitle>
            <CardDescription>
              Please review the research proposal and submit your evaluation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Reviewer Info */}
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md border border-blue-200 dark:border-blue-800/50">
              <h2 className="text-lg font-medium mb-2 text-blue-800 dark:text-blue-400 flex items-center gap-2">
                <User className="h-5 w-5" />
                Welcome, {reviewer?.name || "Reviewer"}
              </h2>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Thank you for agreeing to review this research proposal. Your
                expertise is highly valuable to us.
              </p>
            </div>

            {/* Download Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                Step 1: Download Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Research Proposal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Download the research proposal to review.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={handleDownloadProposal}
                    >
                      <Download className="h-4 w-4" />
                      Download Proposal
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Marking Sheet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Download the marking sheet to fill out.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={handleDownloadMarkingSheet}
                    >
                      <Download className="h-4 w-4" />
                      Download Marking Sheet
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Proposal Review Form
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Download the review form to complete.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={() => handleDownloadReviewForm()}
                    >
                      <Download className="h-4 w-4" />
                      Download Review Form
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Invoice Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Download the invoice template for billing.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={() => handleDownloadInvoiceTemplate()}
                    >
                      <Download className="h-4 w-4" />
                      Download Invoice Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Upload Section 1: Marking Sheet */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                Step 2: Upload Completed Marking Sheet
              </h3>

              <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 px-6 py-8 text-center">
                <label className="flex flex-col items-center cursor-pointer text-sm">
                  <Upload className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <span className="font-medium text-emerald-800 dark:text-emerald-300 mb-1">
                    Upload Completed Marking Sheet (PDF)
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                    Max size: 5MB
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    id="marksheet-file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange("marksheet", e)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 dark:border-emerald-800"
                    onClick={() =>
                      document.getElementById("marksheet-file").click()
                    }
                  >
                    Select File
                  </Button>
                  {selectedMarksheet && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                      <CheckCircle className="h-4 w-4" />
                      {selectedMarksheet.name}
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Upload Section 2: Proposal Review Sheet */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                Step 3: Upload Proposal Review Sheet
              </h3>

              <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 px-6 py-8 text-center">
                <label className="flex flex-col items-center cursor-pointer text-sm">
                  <ClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <span className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                    Upload Proposal Review Sheet (PDF)
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                    Max size: 5MB
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    id="review-form-file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange("review", e)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 dark:border-blue-800"
                    onClick={() =>
                      document.getElementById("review-form-file").click()
                    }
                  >
                    Select File
                  </Button>
                  {selectedReviewForm && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                      <CheckCircle className="h-4 w-4" />
                      {selectedReviewForm.name}
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Upload Section 3: Invoice */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                Step 4: Upload Signed Invoice
              </h3>

              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 mb-4">
                <AlertDescription className="text-amber-800 dark:text-amber-300">
                  If you get more than one proposal for review, you can upload
                  just a signed blank bill form against all of them.
                </AlertDescription>
              </Alert>

              <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 px-6 py-8 text-center">
                <label className="flex flex-col items-center cursor-pointer text-sm">
                  <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
                  <span className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                    Upload Signed Invoice (PDF)
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                    Max size: 5MB
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    id="invoice-file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange("invoice", e)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-200 dark:border-amber-800"
                    onClick={() =>
                      document.getElementById("invoice-file").click()
                    }
                  >
                    Select File
                  </Button>
                  {selectedInvoice && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      <CheckCircle className="h-4 w-4" />
                      {selectedInvoice.name}
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Separator />

            {/* Total Mark */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Step 4: Enter Total Mark</h3>

              <div className="grid gap-2 max-w-xs">
                <Label htmlFor="total_mark">Total Mark (out of 100)</Label>
                <Input
                  id="total_mark"
                  type="number"
                  placeholder="enter total mark"
                  min="0"
                  max="100"
                  step="0.01"
                  value={totalMark}
                  onChange={(e) => setTotalMark(e.target.value)}
                  className="border-emerald-200 dark:border-emerald-800/50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter the total mark you've calculated based on the marking
                  sheet
                </p>
              </div>
            </div>

            {/* Submit Section */}
          </CardContent>
          <CardFooter className="border-t border-gray-100 dark:border-gray-800 px-6 py-4">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto"
              disabled={submitting || !selectedMarksheet || !totalMark}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
