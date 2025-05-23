import React, { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  FileText,
  Download,
  Search,
  CheckCircle,
  Loader2,
  FileCheck,
  Eye,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";

export default function InvoiceManagement() {
  const [reviewers, setReviewers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewerProposalsDialogOpen, setReviewerProposalsDialogOpen] =
    useState(false);
  const [selectedReviewerProposals, setSelectedReviewerProposals] = useState({
    reviewer: null,
    proposals: [],
  });

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
      // Handle error silently
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
      setLoading(false);
    }
  };

  const showReviewerProposals = (reviewer) => {
    const reviewerAssignments = getReviewerAssignments(
      reviewer._id,
      selectedFiscalYear
    );
    setSelectedReviewerProposals({
      reviewer,
      proposals: reviewerAssignments,
    });
    setReviewerProposalsDialogOpen(true);
  };

  const getReviewerAssignments = (reviewerId, fiscalYear) => {
    return assignments.filter(
      (assignment) =>
        assignment.reviewer_id._id === reviewerId &&
        assignment.proposal?.fiscal_year === fiscalYear
    );
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

  const getReviewerInvoice = (reviewerId, fiscalYear) => {
    return invoices.find(
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
        <h2 className="text-2xl font-bold mb-4">Honorarium Management</h2>
        <p className="text-muted-foreground">
          View submitted honorarium forms from reviewers
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
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-emerald-50/50 dark:bg-emerald-900/20">
                <TableHead className="w-[25%]">Name</TableHead>
                <TableHead className="w-[30%]">Email</TableHead>
                <TableHead className="w-[20%]">Reviewed Proposals</TableHead>
                <TableHead className="w-[25%]">Honorarium Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
                    colSpan={4}
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
                  const invoice = getReviewerInvoice(
                    reviewer._id,
                    selectedFiscalYear
                  );

                  return (
                    <TableRow
                      key={reviewer._id}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
                    >
                      <TableCell className="font-medium w-1/4">
                        {reviewer.name}
                      </TableCell>
                      <TableCell className="w-1/4">{reviewer.email}</TableCell>
                      <TableCell className="w-1/4">
                        {reviewerAssignments.length > 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showReviewerProposals(reviewer)}
                            className="p-0 hover:bg-transparent"
                          >
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer"
                            >
                              {reviewerAssignments.length} Proposal
                              {reviewerAssignments.length > 1 ? "s" : ""}
                            </Badge>
                          </Button>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="w-1/4">
                        {!invoice ? (
                          // No form submitted
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              Not Submitted
                            </Badge>
                          </div>
                        ) : (
                          // Form submitted (regardless of status)
                          <div className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground">
                              Submitted: {formatDate(invoice.createdAt)}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 w-36"
                              onClick={() => {
                                const baseUrl = import.meta.env.VITE_API_URL || "";
                                const serverRoot = baseUrl.replace(/\/v1$/, "");
                                const fileUrl = `${serverRoot}/${invoice.invoice_url}`;
                                window.open(fileUrl, "_blank");
                              }}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> View Form
                            </Button>
                          </div>
                        )}
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

      {/* Reviewer Proposals Dialog */}
      <Dialog
        open={reviewerProposalsDialogOpen}
        onOpenChange={setReviewerProposalsDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Reviewed Proposals</DialogTitle>
            <DialogDescription>
              Proposals reviewed by {selectedReviewerProposals.reviewer?.name}{" "}
              in {selectedFiscalYear}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex gap-4 items-center">
                <User className="h-10 w-10 text-blue-500" />
                <div>
                  <h3 className="font-medium text-lg">
                    {selectedReviewerProposals.reviewer?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedReviewerProposals.reviewer?.email}
                  </p>
                  {selectedReviewerProposals.reviewer?.department && (
                    <p className="text-sm text-muted-foreground">
                      Department:{" "}
                      {selectedReviewerProposals.reviewer.department}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proposal Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedReviewerProposals.proposals.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No proposals reviewed in this fiscal year
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedReviewerProposals.proposals.map(
                      (assignment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {assignment.proposal?.proposal_number || "N/A"}
                          </TableCell>
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
                      )
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setReviewerProposalsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
