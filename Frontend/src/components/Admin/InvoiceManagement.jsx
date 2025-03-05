import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  FileText,
  Mail,
  Download,
  Trash2,
  FileCheck,
  Search,
  CheckCircle,
  Clock,
  Calendar,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function InvoiceManagement() {
  const [reviewers, setReviewers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("");
  const [reviewerAssignments, setReviewerAssignments] = useState([]);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    fiscalYear: "all",
  });
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  // Convert number to words function
  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertLessThanThousand = (num) => {
      if (num === 0) return "";
      let result = "";
      if (num >= 100) {
        result = ones[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }
      if (num >= 10 && num <= 19) {
        result += teens[num - 10];
        return result;
      } else if (num >= 20) {
        result += tens[Math.floor(num / 10)];
        num %= 10;
        if (num > 0) result += "-" + ones[num];
        return result;
      } else if (num > 0) {
        result += ones[num];
        return result;
      }
      return result;
    };

    if (num === 0) return "Zero";
    let result = "";

    if (num >= 1000) {
      result += convertLessThanThousand(Math.floor(num / 1000)) + " Thousand ";
      num %= 1000;
    }

    result += convertLessThanThousand(num);

    return result.trim();
  };

  useEffect(() => {
    fetchReviewers();
    fetchAssignments();
    fetchInvoices();
  }, []);

  const fetchReviewers = async () => {
    try {
      const response = await api.get("/api/admin/get-reviewers");
      if (response.data && response.data.reviewers) {
        setReviewers(response.data.reviewers);
      }
    } catch (error) {
      console.error("Failed to fetch reviewers:", error);
      toast.error("Failed to load reviewers");
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get("/api/admin/reviewer/review-details");
      if (response.data) {
        setAssignments(response.data);

        // Extract all unique fiscal years from assignments
        const years = new Set();
        response.data.forEach((assignment) => {
          if (assignment.proposal && assignment.proposal.fiscal_year) {
            years.add(assignment.proposal.fiscal_year);
          }
        });
        setFiscalYears(Array.from(years));

        // Set default selected fiscal year to the most recent
        if (years.size > 0) {
          const sortedYears = Array.from(years).sort().reverse();
          setSelectedFiscalYear(sortedYears[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await api.get("/api/admin/invoices");
      if (response.data && response.data.success) {
        setInvoices(response.data.invoices);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setLoading(false);
    }
  };

  const getReviewerAssignments = (reviewerId, fiscalYear) => {
    return assignments.filter(
      (assignment) =>
        assignment.reviewer_id._id === reviewerId &&
        assignment.proposal?.fiscal_year === fiscalYear
    );
  };

  const openInvoiceDialog = (reviewer) => {
    setSelectedReviewer(reviewer);
    const assignments = getReviewerAssignments(
      reviewer._id,
      selectedFiscalYear
    );
    setReviewerAssignments(assignments);
    setShowInvoiceDialog(true);
  };

  // Generate PDF invoice
  const generateInvoice = async () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();

      // Add logo
      const logoUrl = "/jkkniuBanglaLogo.png";
      const img = new Image();
      img.src = logoUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Document header with logo
      const logoWidth = 25;
      const logoHeight = 25;
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage(
        img,
        "PNG",
        (pageWidth - logoWidth) / 2,
        10,
        logoWidth,
        logoHeight
      );

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Research and Extension Center", pageWidth / 2, 45, {
        align: "center",
      });
      doc.setFontSize(12);
      doc.text("JKKNIU", pageWidth / 2, 52, { align: "center" });
      doc.text("Trishal, Mymensingh", pageWidth / 2, 59, { align: "center" });

      doc.setLineWidth(0.5);
      doc.line(20, 65, pageWidth - 20, 65);

      doc.setFontSize(14);
      doc.text("Reviewer Honorarium Bill Form", pageWidth / 2, 75, {
        align: "center",
      });

      // Reviewer info table
      doc.setFontSize(11);
      const tableData = [
        ["Reviewer name", selectedReviewer?.name || ""],
        ["Designation", ""],
        ["Department", selectedReviewer?.department || ""],
        ["Address", ""],
        ["Fiscal Year", selectedFiscalYear],
      ];

      autoTable(doc, {
        startY: 85,
        head: [],
        body: tableData,
        theme: "plain",
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: "bold" },
          1: { cellWidth: 100 },
        },
        margin: { left: 30 },
      });

      // Proposals table
      const proposalTableData = [];
      let totalPayment = 0;

      reviewerAssignments.forEach((assignment, index) => {
        const amount = 2000; // Fixed honorarium amount per review
        const tax = amount * 0.1; // 10% tax
        const received = amount - tax;

        totalPayment += received;

        proposalTableData.push([
          index + 1,
          assignment.proposal?.proposal_number || "N/A",
          `${amount.toFixed(2)}`,
          `${tax.toFixed(2)}`,
          `${received.toFixed(2)}`,
          "", // Revenue column (to be filled manually)
        ]);
      });

      // Add total row
      if (proposalTableData.length > 0) {
        proposalTableData.push([
          "",
          "Total",
          `${(2000 * reviewerAssignments.length).toFixed(2)}`,
          `${(200 * reviewerAssignments.length).toFixed(2)}`,
          `${totalPayment.toFixed(2)}`,
          "",
        ]);
      }

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [
          [
            "Serial",
            "Proposal No.",
            "Total Amount (BDT)",
            "Tax (10%)",
            "Received Amount",
            "Revenue",
          ],
        ],
        body: proposalTableData,
        theme: "grid",
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: 40,
          fontStyle: "bold",
        },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 15 },
          5: { cellWidth: 30 },
        },
        margin: { left: 20 },
      });

      // Amount in words
      doc.setFontSize(10);
      doc.text(
        `In words: ${numberToWords(totalPayment)} Taka Only`,
        20,
        doc.lastAutoTable.finalY + 15
      );

      // Signature lines
      doc.setFontSize(10);
      doc.text("Reviewer's Signature", 40, doc.lastAutoTable.finalY + 40, {
        align: "center",
      });
      doc.text(
        "Recommended by",
        pageWidth - 40,
        doc.lastAutoTable.finalY + 40,
        { align: "center" }
      );

      // Create a blob from the PDF and convert to file
      const pdfBlob = doc.output("blob");
      const pdfFile = new File(
        [pdfBlob],
        `invoice_${selectedReviewer?.name.replace(
          /\s+/g,
          "_"
        )}_${selectedFiscalYear}.pdf`,
        { type: "application/pdf" }
      );

      return pdfFile;
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      throw error;
    }
  };

  // Send invoice to reviewer
  const sendInvoice = async () => {
    if (!selectedReviewer || !selectedFiscalYear) {
      toast.error("Please select a reviewer and fiscal year");
      return;
    }

    try {
      setSendingInvoice(true);

      // Generate PDF invoice
      const pdfFile = await generateInvoice();

      const formData = new FormData();
      formData.append("invoice", pdfFile);
      formData.append("reviewer_id", selectedReviewer._id);
      formData.append("fiscal_year", selectedFiscalYear);

      const response = await api.post("/api/admin/reviewer-invoice", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.success) {
        toast.success("Invoice sent successfully");
        setShowInvoiceDialog(false);
        fetchInvoices(); // Refresh invoice list
      }
    } catch (error) {
      console.error("Failed to send invoice:", error);
      toast.error(error.response?.data?.message || "Failed to send invoice");
    } finally {
      setSendingInvoice(false);
    }
  };

  const deleteInvoice = async (invoiceId) => {
    try {
      const response = await api.delete(
        `/api/admin/invoice/delete/${invoiceId}`
      );
      if (response.data && response.data.success) {
        toast.success("Invoice deleted successfully");
        fetchInvoices(); // Refresh invoice list
      }
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast.error(error.response?.data?.message || "Failed to delete invoice");
    }
  };

  // Filter reviewers based on search query
  const filteredReviewers = reviewers.filter((reviewer) => {
    const searchMatch =
      searchQuery === "" ||
      reviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reviewer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reviewer.department &&
        reviewer.department.toLowerCase().includes(searchQuery.toLowerCase()));

    return searchMatch;
  });

  // Filter invoices based on filters
  const filteredInvoices = invoices.filter((invoice) => {
    const fiscalYearMatch =
      filters.fiscalYear === "all" ||
      invoice.fiscal_year === filters.fiscalYear;

    return fiscalYearMatch;
  });

  const hasInvoiceForReviewer = (reviewerId, fiscalYear) => {
    return invoices.some(
      (invoice) =>
        invoice.reviewer_id._id === reviewerId &&
        invoice.fiscal_year === fiscalYear
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Invoice Management</h2>
        <p className="text-muted-foreground">
          Generate and manage invoices for proposal reviewers
        </p>
      </div>

      {/* Reviewer Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Reviewers</h3>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviewers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedFiscalYear}
              onValueChange={setSelectedFiscalYear}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50/50 dark:bg-emerald-900/20">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Reviewed Proposals</TableHead>
                <TableHead>Invoice Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredReviewers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No reviewers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviewers.map((reviewer) => {
                  const reviewerAssignments = getReviewerAssignments(
                    reviewer._id,
                    selectedFiscalYear
                  );
                  const hasInvoice = hasInvoiceForReviewer(
                    reviewer._id,
                    selectedFiscalYear
                  );

                  return (
                    <TableRow
                      key={reviewer._id}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
                    >
                      <TableCell className="font-medium">
                        {reviewer.name}
                      </TableCell>
                      <TableCell>{reviewer.email}</TableCell>
                      <TableCell>{reviewer.department || "—"}</TableCell>
                      <TableCell>
                        {reviewerAssignments.length > 0 ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {reviewerAssignments.length} Proposal
                            {reviewerAssignments.length > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {hasInvoice ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Sent
                          </Badge>
                        ) : reviewerAssignments.length > 0 ? (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            Pending
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-700 border-gray-200"
                          >
                            N/A
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            disabled={
                              reviewerAssignments.length === 0 || hasInvoice
                            }
                            onClick={() => openInvoiceDialog(reviewer)}
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" /> Generate
                            Invoice
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Separator />

      {/* Submitted Invoices Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Submitted Invoices</h3>
          <div className="flex gap-2">
            <Select
              value={filters.fiscalYear}
              onValueChange={(value) =>
                setFilters({ ...filters, fiscalYear: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fiscal Years</SelectItem>
                {fiscalYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50/50 dark:bg-emerald-900/20">
                <TableHead>Reviewer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Fiscal Year</TableHead>
                <TableHead>Date Sent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow
                    key={invoice._id}
                    className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
                  >
                    <TableCell className="font-medium">
                      {invoice.reviewer_id.name}
                    </TableCell>
                    <TableCell>{invoice.reviewer_id.email}</TableCell>
                    <TableCell>{invoice.fiscal_year}</TableCell>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Submitted
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          onClick={() => {
                            const baseUrl = import.meta.env.VITE_API_URL || "";
                            const serverRoot = baseUrl.replace(/\/v1$/, "");
                            const fileUrl = `${serverRoot}/${invoice.invoice_url}`;
                            window.open(fileUrl, "_blank");
                          }}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" /> View Invoice
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          onClick={() => deleteInvoice(invoice._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Generate Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Generate an invoice for {selectedReviewer?.name} for the fiscal
              year {selectedFiscalYear}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex gap-4 items-center">
                <User className="h-10 w-10 text-blue-500" />
                <div>
                  <h3 className="font-medium text-lg">
                    {selectedReviewer?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedReviewer?.email}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Reviewed Proposals</h4>
              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewerAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No proposals reviewed in this fiscal year
                        </TableCell>
                      </TableRow>
                    ) : (
                      reviewerAssignments.map((assignment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {assignment.proposal?.project_title ||
                              "Unknown Title"}
                          </TableCell>
                          <TableCell>
                            {assignment.status === 1 ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                Reviewed
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700 border-yellow-200"
                              >
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {assignment.status === 1
                              ? assignment.total_mark
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm">
              <p className="flex items-center text-yellow-800">
                <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                This will generate an invoice and send it to the reviewer for
                signature
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInvoiceDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={sendInvoice}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={sendingInvoice || reviewerAssignments.length === 0}
            >
              {sendingInvoice ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" /> Generate & Send Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
