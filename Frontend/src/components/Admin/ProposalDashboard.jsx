import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  Download,
  Mail,
  Trash2,
  AlertCircle,
  User,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Filter,
  File,
  UserSquare,
  GraduationCap,
  CalendarClock,
  Building,
  ChevronUp,
  ChevronDown,
  X,
  DollarSign,
  MailCheck,
  Clock,
  Loader2, 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function ProposalsDashboard() {
  // State variables
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDocumentTab, setActiveDocumentTab] = useState("partA");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [reviewerName1, setReviewerName1] = useState("");
  const [reviewerName2, setReviewerName2] = useState("");
  const [reviewerEmail1, setReviewerEmail1] = useState("");
  const [reviewerEmail2, setReviewerEmail2] = useState("");
  const [existingReviewers, setExistingReviewers] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [sendingEmails, setSendingEmails] = useState(false);

  const [showReviewerDetailsDialog, setShowReviewerDetailsDialog] =
    useState(false);
  const [selectedProposalReviewers, setSelectedProposalReviewers] =
    useState(null);
  const [reviewAssignments, setReviewAssignments] = useState([]);

  const [sortConfig, setSortConfig] = useState({
    key: "submissionDate",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    status: "all",
    department: "all",
    fiscalYear: "all",
    applicantType: "all",
  });
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    fiscalYears: [],
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    student: 0,
    teacher: 0,
    pending: 0,
    pending_review: 0,
    reviewed: 0,
    allocated: 0,
  });

  // New state for allocation dialog
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [selectedProposalForAllocation, setSelectedProposalForAllocation] =
    useState(null);
  const [allocatedAmount, setAllocatedAmount] = useState("");

  useEffect(() => {
    fetchProposals();
    fetchReviewers();
    fetchReviewerAssignments();
  }, []);

  const fetchReviewers = async () => {
    try {
      const response = await api.get("/api/admin/get-reviewers");
      if (response.data && response.data.reviewers) {
        setExistingReviewers(response.data.reviewers);
      }
    } catch (error) {
      console.error("Failed to fetch reviewers:", error);
    }
  };

  const openReviewerDetailsDialog = (proposal) => {
    const proposalAssignments = reviewAssignments.filter((assignment) => {
      const proposalIdStr = proposal.id.toString();
      const assignmentProposalIdStr = (
        typeof assignment.proposal_id === "object" && assignment.proposal_id._id
          ? assignment.proposal_id._id
          : assignment.proposal_id
      ).toString();

      return proposalIdStr === assignmentProposalIdStr;
    });

    // Prepare reviewer details with marks - with more robust ID matching
    const reviewerDetails = proposal.reviewers.map((reviewer) => {
      const reviewerIdStr = (
        typeof reviewer.id === "object" && reviewer.id._id
          ? reviewer.id._id
          : reviewer.id
      ).toString();

      // Find matching assignment with careful ID comparison
      const assignment = proposalAssignments.find((a) => {
        const assignmentReviewerIdStr = (
          typeof a.reviewer_id === "object" && a.reviewer_id._id
            ? a.reviewer_id._id
            : a.reviewer_id
        ).toString();

        return reviewerIdStr === assignmentReviewerIdStr;
      });

      let reviewerName = reviewer.name || "Unknown Name";
      let reviewerEmail = reviewer.email || "No email available";

      // Try to get full details from assignment
      if (
        assignment &&
        typeof assignment.reviewer_id === "object" &&
        assignment.reviewer_id.name
      ) {
        reviewerName = assignment.reviewer_id.name;
        reviewerEmail = assignment.reviewer_id.email || reviewerEmail;
      }
      // If not found, try to find in existingReviewers
      else {
        const fullReviewerDetails = existingReviewers.find(
          (r) => r._id && r._id.toString() === reviewerIdStr
        );

        if (fullReviewerDetails) {
          reviewerName = fullReviewerDetails.name;
          reviewerEmail = fullReviewerDetails.email || reviewerEmail;
        }
      }

      return {
        id: reviewer.id,
        name: reviewerName,
        email: reviewerEmail,
        marks: assignment?.total_mark || null,
        status: assignment?.status || 0,
        markSheetUrl: assignment?.mark_sheet_url || null,
      };
    });

    setSelectedProposalReviewers({
      proposal: proposal,
      reviewers: reviewerDetails,
    });
    setShowReviewerDetailsDialog(true);
  };

  const fetchReviewerAssignments = async () => {
    try {
      const response = await api.get("/api/admin/reviewer/review-details");
      if (response.data) {
        setReviewAssignments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch reviewer assignments:", error);
    }
  };

  // Status badge renderer with all 5 status types
  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case 1:
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            Under Review
          </Badge>
        );
      case 2:
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Reviewed
          </Badge>
        );
      case 3:
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 border-purple-200"
          >
            Allocated
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-200"
          >
            Unknown
          </Badge>
        );
    }
  };

  const getApplicantIcon = (type) => {
    return type === "Student" ? (
      <GraduationCap className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
    ) : (
      <UserSquare className="h-4 w-4 text-purple-500 dark:text-purple-400 mr-2" />
    );
  };

  // Fetch all proposals with complete details
  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/admin/research-proposal");

      if (response.data) {
        const { studentProposals, teacherProposals } = response.data;

        // Format proposals with a common structure
        const formattedProposals = [
          ...studentProposals.map((p) => ({
            id: p._id,
            proposalNumber: p.proposal_number,
            title: p.project_title,
            applicant: p.project_director.name_en,
            applicantType: "Student",
            department: p.department,
            faculty: p.faculty,
            fiscalYear: p.fiscal_year,
            submissionDate: p.createdAt,
            status: p.status,
            totalMarks: p.reviewer_avg_mark || null,
            totalBudget: p.total_budget,
            partAPdfUrl: p.pdf_url_part_A,
            partBPdfUrl: p.pdf_url_part_B,
            reviewers: Array.isArray(p.reviewer)
              ? p.reviewer.map((r) => {
                  // Extract the correct ID format
                  const reviewerId =
                    typeof r.id === "object" && r.id.$oid
                      ? r.id.$oid
                      : r.id?._id || r.id;

                  // Find matching reviewer details
                  const reviewerDetails = existingReviewers.find(
                    (reviewer) =>
                      reviewer._id.toString() === reviewerId.toString()
                  );

                  return {
                    id: reviewerId,
                    name: reviewerDetails?.name || "Unknown",
                    email: reviewerDetails?.email || "",
                  };
                })
              : [],
          })),
          ...teacherProposals.map((p) => ({
            id: p._id,
            proposalNumber: p.proposal_number,
            title: p.project_title,
            applicant: p.project_director.name_en,
            applicantType: "Teacher",
            department: p.department,
            faculty: p.faculty,
            fiscalYear: p.fiscal_year,
            submissionDate: p.createdAt,
            status: p.status,
            totalMarks: p.reviewer_avg_mark || null,
            totalBudget: p.total_budget,
            partAPdfUrl: p.pdf_url_part_A,
            partBPdfUrl: p.pdf_url_part_B,
            reviewers: Array.isArray(p.reviewer)
              ? p.reviewer.map((r) => {
                  // Extract the correct ID format
                  const reviewerId =
                    typeof r.id === "object" && r.id.$oid
                      ? r.id.$oid
                      : r.id?._id || r.id;

                  // Find matching reviewer details
                  const reviewerDetails = existingReviewers.find(
                    (reviewer) =>
                      reviewer._id.toString() === reviewerId.toString()
                  );

                  return {
                    id: reviewerId,
                    name: reviewerDetails?.name || "Unknown",
                    email: reviewerDetails?.email || "",
                  };
                })
              : [],
          })),
        ];

        setProposals(formattedProposals);

        // Extract filter options
        const departments = [
          ...new Set(formattedProposals.map((p) => p.department)),
        ];
        const fiscalYears = [
          ...new Set(formattedProposals.map((p) => p.fiscalYear)),
        ];

        setFilterOptions({
          departments,
          fiscalYears,
        });

        // Update statistics
        const stats = {
          total: formattedProposals.length,
          student: formattedProposals.filter(
            (p) => p.applicantType === "Student"
          ).length,
          teacher: formattedProposals.filter(
            (p) => p.applicantType === "Teacher"
          ).length,
          pending: formattedProposals.filter((p) => p.status === 0).length,
          pending_review: formattedProposals.filter((p) => p.status === 1)
            .length,
          reviewed: formattedProposals.filter((p) => p.status === 2).length,
          allocated: formattedProposals.filter((p) => p.status === 3).length,
        };

        setStatistics(stats);
      }
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch proposals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update proposal status and handle allocation
  const updateProposalStatus = async (
    proposal,
    newStatus,
    allocatedBudget = null
  ) => {
    try {
      // First, update the status via API
      const response = await api.put(
        `/api/admin/research-proposal/status-update/${proposal.applicantType.toLowerCase()}/${
          proposal.id
        }/${newStatus}`
      );

      if (response.data) {
        // If budget is being allocated, update it as well
        if (newStatus === 1 && allocatedBudget) {
          await api.post("/api/admin/research-proposal/approval-budget", {
            proposal_id: proposal.id,
            proposal_type: proposal.applicantType.toLowerCase(),
            approval_budget: allocatedBudget,
          });
        }

        toast.success("Status updated successfully");

        // Update the proposal in the local state
        setProposals((prevProposals) =>
          prevProposals.map((p) =>
            p.id === proposal.id
              ? {
                  ...p,
                  status: newStatus,
                  totalBudget: allocatedBudget || p.totalBudget,
                }
              : p
          )
        );

        // Update statistics
        fetchProposals();
      }
    } catch (error) {
      console.error("Failed to update proposal status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Handle allocation submission
  const handleAllocation = () => {
    if (!selectedProposalForAllocation || !allocatedAmount) {
      toast.error("Please enter an allocation amount");
      return;
    }

    try {
      api
        .post("/api/admin/research-proposal/approval-budget", {
          proposal_id: selectedProposalForAllocation.id,
          proposal_type:
            selectedProposalForAllocation.applicantType.toLowerCase(),
          approval_budget: parseFloat(allocatedAmount),
        })
        .then(() => {
          // Then update the status to allocated (3)
          updateProposalStatus(
            selectedProposalForAllocation,
            1, // Allocated status
            parseFloat(allocatedAmount)
          );

          setShowAllocationDialog(false);
          setSelectedProposalForAllocation(null);
          setAllocatedAmount("");

          toast.success("Budget allocated successfully");

          // Refresh proposals
          fetchProposals();
        });
    } catch (error) {
      console.error("Failed to allocate budget:", error);
      toast.error(error.response?.data?.message || "Failed to allocate budget");
    }
  };

  const handleSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === "asc";
    setSortConfig({
      key,
      direction: isAsc ? "desc" : "asc",
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "all",
      department: "all",
      fiscalYear: "all",
      applicantType: "all",
    });
  };



  const assignReviewers = async (proposal) => {
    if (!proposal) return;

    if (
      !reviewerName1 ||
      !reviewerEmail1 ||
      !reviewerName2 ||
      !reviewerEmail2
    ) {
      toast.error("Please enter all reviewer details");
      return;
    }

    if (reviewerEmail1.toLowerCase() === reviewerEmail2.toLowerCase()) {
      toast.error("Cannot assign the same reviewer twice");
      return;
    }

    try {
      setSendingEmails(true);
      // Handle first reviewer
      let reviewer1Id;
      const existingReviewer1 = existingReviewers.find(
        (r) => r.email.toLowerCase() === reviewerEmail1.toLowerCase()
      );

      if (existingReviewer1) {
        reviewer1Id = existingReviewer1._id;
      } else {
        // Create new reviewer
        const newReviewer1Res = await api.post("/api/admin/reviewer/add", {
          name: reviewerName1,
          email: reviewerEmail1,
        });

        if (newReviewer1Res.data && newReviewer1Res.data.reviewer) {
          reviewer1Id = newReviewer1Res.data.reviewer._id;
          // Add to existing reviewers
          setExistingReviewers([
            ...existingReviewers,
            newReviewer1Res.data.reviewer,
          ]);
        } else {
          throw new Error("Failed to create reviewer 1");
        }
      }

      // Handle second reviewer
      let reviewer2Id;
      const existingReviewer2 = existingReviewers.find(
        (r) => r.email.toLowerCase() === reviewerEmail2.toLowerCase()
      );

      if (existingReviewer2) {
        reviewer2Id = existingReviewer2._id;
      } else {
        // Create new reviewer
        const newReviewer2Res = await api.post("/api/admin/reviewer/add", {
          name: reviewerName2,
          email: reviewerEmail2,
        });

        if (newReviewer2Res.data && newReviewer2Res.data.reviewer) {
          reviewer2Id = newReviewer2Res.data.reviewer._id;
          // Add to existing reviewers
          setExistingReviewers([
            ...existingReviewers,
            newReviewer2Res.data.reviewer,
          ]);
        } else {
          throw new Error("Failed to create reviewer 2");
        }
      }

      // USE THE PROPOSAL PASSED AS ARGUMENT INSTEAD OF selectedProposal
      // Send first reviewer invitation
      await api.post("/api/admin/research-proposal/sent-to-reviewer", {
        proposal_id: proposal.id,
        proposal_type: proposal.applicantType.toLowerCase(),
        reviewer_id: reviewer1Id,
      });

      // Send second reviewer invitation
      await api.post("/api/admin/research-proposal/sent-to-reviewer", {
        proposal_id: proposal.id,
        proposal_type: proposal.applicantType.toLowerCase(),
        reviewer_id: reviewer2Id,
      });

      toast.success("Reviewer invitations sent successfully");

      // Update the proposal in the local state using proposal.id
      setProposals((prevProposals) =>
        prevProposals.map((p) =>
          p.id === proposal.id
            ? {
                ...p,
                reviewers: [
                  {
                    id: reviewer1Id,
                    name: reviewerName1,
                    email: reviewerEmail1,
                  },
                  {
                    id: reviewer2Id,
                    name: reviewerName2,
                    email: reviewerEmail2,
                  },
                ],
                status: 1, // Set to "Under Review"
              }
            : p
        )
      );

      // Reset reviewer inputs
      setReviewerName1("");
      setReviewerEmail1("");
      setReviewerName2("");
      setReviewerEmail2("");

      // Update statistics
      fetchProposals();
    } catch (error) {
      console.error("Failed to assign reviewers:", error);
      toast.error(
        error.response?.data?.message || "Failed to assign reviewers"
      );
    } finally {
      setSendingEmails(false);
    }
  };

  const deleteProposal = async (proposalId) => {
    try {
      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal) return;

      const response = await api.put(
        `/api/admin/research-proposal/status-update/${proposal.applicantType.toLowerCase()}/${proposalId}/2`
      );

      if (response.data) {
        toast.success("Proposal deleted successfully");

        // Remove the proposal from local state
        setProposals((prevProposals) =>
          prevProposals.filter((p) => p.id !== proposalId)
        );

        // Update statistics
        fetchProposals();
      }
    } catch (error) {
      console.error("Failed to delete proposal:", error);
      toast.error(error.response?.data?.message || "Failed to delete proposal");
    }
  };

  // Filter and sort proposals
  const filteredProposals = proposals
    .filter((proposal) => {
      const matchesSearch =
        searchQuery === "" ||
        proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (proposal.proposalNumber &&
          proposal.proposalNumber.toString().includes(searchQuery));

      const matchesDepartment =
        filters.department === "all" ||
        proposal.department === filters.department;

      const matchesFiscalYear =
        filters.fiscalYear === "all" ||
        proposal.fiscalYear === filters.fiscalYear;

      const matchesApplicantType =
        filters.applicantType === "all" ||
        proposal.applicantType.toLowerCase() === filters.applicantType;

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "pending" && proposal.status === 0) ||
        (filters.status === "pending_review" && proposal.status === 1) ||
        (filters.status === "reviewed" && proposal.status === 2) ||
        (filters.status === "allocated" && proposal.status === 3);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesFiscalYear &&
        matchesApplicantType &&
        matchesStatus
      );
    })
    .sort((a, b) => {
      const key = sortConfig.key;

      if (key === "submissionDate") {
        return sortConfig.direction === "asc"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }

      if (key === "totalMarks") {
        // Handle null values in sorting
        if (a[key] === null && b[key] === null) return 0;
        if (a[key] === null) return 1;
        if (b[key] === null) return -1;

        return sortConfig.direction === "asc"
          ? a[key] - b[key]
          : b[key] - a[key];
      }

      return sortConfig.direction === "asc"
        ? a[key]?.localeCompare(b[key] || "")
        : b[key]?.localeCompare(a[key] || "");
    });

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
        <h2 className="text-2xl font-bold mb-4">Research Proposals</h2>
        <p className="text-muted-foreground">
          Manage and review research proposals
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Proposals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.total}</div>
            <div className="text-xs text-muted-foreground mt-1 flex justify-between">
              <span className="flex items-center">
                <GraduationCap className="h-3 w-3 mr-1" />
                Students: {statistics.student}
              </span>
              <span className="flex items-center">
                <UserSquare className="h-3 w-3 mr-1" />
                Teachers: {statistics.teacher}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {statistics.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {statistics.pending_review}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {statistics.reviewed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, title, applicant or department..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 self-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className={cn(
                "border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30",
                filtersExpanded && "bg-emerald-50 dark:bg-emerald-900/30"
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              {filtersExpanded ? "Hide Filters" : "Show Filters"}
            </Button>
            {(searchQuery ||
              filters.status !== "all" ||
              filters.department !== "all" ||
              filters.fiscalYear !== "all" ||
              filters.applicantType !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {filtersExpanded && (
          <Card className="border-emerald-100 dark:border-emerald-800/50">
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
              <div>
                <Label className="text-sm mb-2 block">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="pending_review">Under Review</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="allocated">Allocated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Department</Label>
                <Select
                  value={filters.department}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {filterOptions.departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Fiscal Year</Label>
                <Select
                  value={filters.fiscalYear}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, fiscalYear: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select fiscal year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fiscal Years</SelectItem>
                    {filterOptions.fiscalYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Applicant Type</Label>
                <Select
                  value={filters.applicantType}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, applicantType: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select applicant type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="student">
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                        Student
                      </div>
                    </SelectItem>
                    <SelectItem value="teacher">
                      <div className="flex items-center">
                        <UserSquare className="h-4 w-4 mr-2 text-purple-500" />
                        Teacher
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sorting Options */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort("submissionDate")}
            className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <CalendarClock className="h-4 w-4 mr-2" />
            Date
            {sortConfig.key === "submissionDate" &&
              (sortConfig.direction === "asc" ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              ))}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort("totalMarks")}
            className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Score
            {sortConfig.key === "totalMarks" &&
              (sortConfig.direction === "asc" ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              ))}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort("department")}
            className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <Building className="h-4 w-4 mr-2" />
            Department
            {sortConfig.key === "department" &&
              (sortConfig.direction === "asc" ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              ))}
          </Button>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-emerald-50/50 dark:bg-emerald-900/20">
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Fiscal Year</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProposals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  {loading ? "Loading proposals..." : "No proposals found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProposals.map((proposal) => (
                <TableRow
                  key={proposal.id}
                  className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <TableCell className="font-mono text-slate-600">
                    {proposal.proposalNumber || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center">{proposal.title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getApplicantIcon(proposal.applicantType)}
                      <span>{proposal.applicant}</span>
                    </div>
                  </TableCell>
                  <TableCell>{proposal.department}</TableCell>
                  <TableCell>{proposal.fiscalYear}</TableCell>
                  <TableCell>{formatDate(proposal.submissionDate)}</TableCell>
                  <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                  <TableCell>
                    {proposal.totalMarks !== null ? proposal.totalMarks : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* View Documents */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>
                              {proposal.title} - Documents
                            </DialogTitle>
                          </DialogHeader>
                          <Tabs
                            value={activeDocumentTab}
                            onValueChange={setActiveDocumentTab}
                            className="w-full"
                          >
                            <TabsList className="grid grid-cols-2 w-full">
                              <TabsTrigger value="partA">
                                Part A - Application Form
                              </TabsTrigger>
                              <TabsTrigger value="partB">
                                Part B - Proposal
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="partA" className="h-[60vh]">
                              {proposal.partAPdfUrl ? (
                                <>
                                  <div className="bg-slate-50 dark:bg-slate-800/50 border rounded flex items-center justify-center h-full">
                                    <div className="text-center p-6">
                                      <FileText className="h-12 w-12 text-slate-400 mb-4 mx-auto" />
                                      <h3 className="font-medium text-lg mb-2">
                                        View Document
                                      </h3>
                                      <p className="text-muted-foreground text-sm mb-4">
                                        Download the document to view its
                                        contents
                                      </p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const baseUrl =
                                            import.meta.env.VITE_API_URL || "";
                                          const serverRoot = baseUrl.replace(
                                            /\/v1$/,
                                            ""
                                          );
                                          const fileUrl = `${serverRoot}/${proposal.partAPdfUrl}`;
                                          window.open(fileUrl, "_blank");
                                        }}
                                      >
                                        <Download className="mr-2 h-4 w-4" />{" "}
                                        Download Part A
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <p>No document available</p>
                                </div>
                              )}
                            </TabsContent>
                            <TabsContent value="partB" className="h-[60vh]">
                              {proposal.partBPdfUrl ? (
                                <>
                                  <div className="bg-slate-50 dark:bg-slate-800/50 border rounded flex items-center justify-center h-full">
                                    <div className="text-center p-6">
                                      <FileText className="h-12 w-12 text-slate-400 mb-4 mx-auto" />
                                      <h3 className="font-medium text-lg mb-2">
                                        View Document
                                      </h3>
                                      <p className="text-muted-foreground text-sm mb-4">
                                        Download the document to view its
                                        contents
                                      </p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const baseUrl =
                                            import.meta.env.VITE_API_URL || "";
                                          const serverRoot = baseUrl.replace(
                                            /\/v1$/,
                                            ""
                                          );
                                          const fileUrl = `${serverRoot}/${proposal.partBPdfUrl}`;
                                          window.open(fileUrl, "_blank");
                                        }}
                                      >
                                        <Download className="mr-2 h-4 w-4" />{" "}
                                        Download Part B
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <p>No document available</p>
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>

                      {/* Assign Reviewers */}
                      {proposal.reviewers && proposal.reviewers.length === 0 ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Assign Reviewers"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Reviewers</DialogTitle>
                              <DialogDescription>
                                Send this proposal to two reviewers for
                                evaluation.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div>
                                <h3 className="text-sm font-medium mb-2 flex items-center">
                                  <User className="h-4 w-4 mr-2 text-emerald-600" />
                                  Reviewer 1
                                </h3>
                                <div className="grid gap-2 mt-2">
                                  <Label htmlFor="reviewer1Email">Email</Label>
                                  <Input
                                    id="reviewer1Email"
                                    placeholder="reviewer1@example.com"
                                    value={reviewerEmail1}
                                    onChange={(e) => {
                                      setReviewerEmail1(e.target.value);
                                      // Look for matching reviewer in existing reviewers
                                      const matchingReviewer =
                                        existingReviewers?.find(
                                          (r) =>
                                            r.email.toLowerCase() ===
                                            e.target.value.toLowerCase()
                                        );
                                      if (matchingReviewer) {
                                        setReviewerName1(matchingReviewer.name);
                                      } else {
                                        setReviewerName1("");
                                      }
                                    }}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="reviewer1Name">Name</Label>
                                  <Input
                                    id="reviewer1Name"
                                    placeholder="Reviewer 1 name"
                                    value={reviewerName1}
                                    onChange={(e) =>
                                      setReviewerName1(e.target.value)
                                    }
                                    disabled={
                                      reviewerEmail1 === "" ||
                                      existingReviewers?.some(
                                        (r) =>
                                          r.email.toLowerCase() ===
                                          reviewerEmail1.toLowerCase()
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <Separator className="my-2" />

                              <div>
                                <h3 className="text-sm font-medium mb-2 flex items-center">
                                  <User className="h-4 w-4 mr-2 text-emerald-600" />
                                  Reviewer 2
                                </h3>
                                <div className="grid gap-2 mt-2">
                                  <Label htmlFor="reviewer2Email">Email</Label>
                                  <Input
                                    id="reviewer2Email"
                                    placeholder="reviewer2@example.com"
                                    value={reviewerEmail2}
                                    onChange={(e) => {
                                      setReviewerEmail2(e.target.value);
                                      // Look for matching reviewer in existing reviewers
                                      const matchingReviewer =
                                        existingReviewers?.find(
                                          (r) =>
                                            r.email.toLowerCase() ===
                                            e.target.value.toLowerCase()
                                        );
                                      if (matchingReviewer) {
                                        setReviewerName2(matchingReviewer.name);
                                      } else {
                                        setReviewerName2("");
                                      }
                                    }}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="reviewer2Name">Name</Label>
                                  <Input
                                    id="reviewer2Name"
                                    placeholder="Reviewer 2 name"
                                    value={reviewerName2}
                                    onChange={(e) =>
                                      setReviewerName2(e.target.value)
                                    }
                                    disabled={
                                      reviewerEmail2 === "" ||
                                      existingReviewers?.some(
                                        (r) =>
                                          r.email.toLowerCase() ===
                                          reviewerEmail2.toLowerCase()
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  assignReviewers(proposal);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={
                                  !reviewerName1 ||
                                  !reviewerEmail1 ||
                                  !reviewerName2 ||
                                  !reviewerEmail2 ||
                                  reviewerEmail1 === reviewerEmail2 ||
                                  sendingEmails
                                }
                              >
                                {sendingEmails ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="mr-2 h-4 w-4" /> Send
                                    Invitations
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          title="View Assigned Reviewers"
                          className="bg-blue-50 hover:bg-blue-100"
                          onClick={() => openReviewerDetailsDialog(proposal)}
                        >
                          <MailCheck className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {/* Update Marks */}
                      {/* {proposal.reviewers.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Update Review Marks"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Review Marks</DialogTitle>
                              <DialogDescription>
                                Enter the marks given by each reviewer (out of
                                50).
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label className="font-medium text-sm">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-emerald-600" />
                                    {proposal.reviewers[0]?.name}
                                  </div>
                                  <span className="font-normal text-xs text-muted-foreground">
                                    {proposal.reviewers[0]?.email}
                                  </span>
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="50"
                                  placeholder="Marks (0-50)"
                                  defaultValue={
                                    proposal.reviewers[0]?.marksGiven || ""
                                  }
                                  id="reviewer1Marks"
                                  className="border-emerald-200 dark:border-emerald-800/50"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label className="font-medium text-sm">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-emerald-600" />
                                    {proposal.reviewers[1]?.name}
                                  </div>
                                  <span className="font-normal text-xs text-muted-foreground">
                                    {proposal.reviewers[1]?.email}
                                  </span>
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="50"
                                  placeholder="Marks (0-50)"
                                  defaultValue={
                                    proposal.reviewers[1]?.marksGiven || ""
                                  }
                                  id="reviewer2Marks"
                                  className="border-emerald-200 dark:border-emerald-800/50"
                                />
                              </div>
                              {proposal.totalMarks !== null && (
                                <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                                  <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">
                                    Current Total: {proposal.totalMarks}/100
                                  </p>
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  const r1marks =
                                    document.getElementById(
                                      "reviewer1Marks"
                                    ).value;
                                  const r2marks =
                                    document.getElementById(
                                      "reviewer2Marks"
                                    ).value;
                                  updateProposalMarks(
                                    proposal.id,
                                    r1marks,
                                    r2marks
                                  );
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                Update Marks
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )} */}

                      {/* Status Update Buttons */}
                      <div className="flex gap-2 mt-2">
                        {/* Only show the Allocate button - other statuses should be automatic */}
                        {proposal.status !== 3 && proposal.status === 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProposalForAllocation(proposal);
                              setAllocatedAmount(
                                proposal.totalBudget?.toString() || ""
                              );
                              setShowAllocationDialog(true);
                            }}
                            className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700"
                            title="Allocate Funding"
                          >
                            <DollarSign className="h-3 w-3 mr-1" /> Allocate
                          </Button>
                        )}
                      </div>

                      {/* Delete Proposal */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            title="Delete Proposal"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this proposal?
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800/50 my-4">
                            <div className="flex gap-4 items-center">
                              <AlertCircle className="h-10 w-10 text-red-500" />
                              <div>
                                <h4 className="font-medium mb-1">
                                  You're about to delete:
                                </h4>
                                <p className="text-sm font-medium">
                                  {proposal.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Submitted by {proposal.applicant} on{" "}
                                  {new Date(
                                    proposal.submissionDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() =>
                                document.querySelector("dialog").close()
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteProposal(proposal.id)}
                            >
                              Delete Permanently
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Allocation Dialog */}
      <Dialog
        open={showAllocationDialog}
        onOpenChange={setShowAllocationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Funding</DialogTitle>
            <DialogDescription>
              Set the allocated budget for this proposal. This will also mark
              the proposal as Allocated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <h3 className="text-sm font-medium mb-2">
                {selectedProposalForAllocation?.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {selectedProposalForAllocation?.applicant} -{" "}
                {selectedProposalForAllocation?.department}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allocatedBudget" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                Allocated Budget Amount
              </Label>
              <Input
                id="allocatedBudget"
                type="number"
                min="0"
                step="1000"
                placeholder="Enter amount"
                value={allocatedAmount}
                onChange={(e) => setAllocatedAmount(e.target.value)}
                className="border-green-200"
              />
            </div>

            {selectedProposalForAllocation?.totalMarks && (
              <div className="bg-green-50 p-3 rounded-md border border-green-200 flex items-center justify-between">
                <span className="text-sm text-green-800 font-medium">
                  Review Score: {selectedProposalForAllocation.totalMarks}/100
                </span>
                
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAllocationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAllocation}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Allocate Funding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviewer Details Dialog */}
      <Dialog
        open={showReviewerDetailsDialog}
        onOpenChange={setShowReviewerDetailsDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigned Reviewers</DialogTitle>
            <DialogDescription>
              Reviewers assigned to this proposal and their evaluation status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {selectedProposalReviewers?.reviewers.map((reviewer, index) => (
              <div
                key={index}
                className="p-3 bg-slate-50 rounded-md border border-slate-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">
                      {reviewer.name || "Unknown Name"}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      reviewer.status === 1
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                    }
                  >
                    {reviewer.status === 1 ? "Reviewed" : "Pending"}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  {reviewer.email || "No email available"}
                </div>

                {reviewer.status === 1 ? (
                  <div className="space-y-2">
                    <div className="text-sm flex items-center font-medium text-green-700">
                      <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-600" />
                      Marks Given: {reviewer.marks}/100
                    </div>
                    {reviewer.markSheetUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs mt-1 w-full"
                        onClick={() => {
                          const baseUrl = import.meta.env.VITE_API_URL || "";
                          const serverRoot = baseUrl.replace(/\/v1$/, "");
                          const fileUrl = `${serverRoot}/${reviewer.markSheetUrl}`;
                          window.open(fileUrl, "_blank");
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" /> View Marksheet
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-sm flex items-center text-amber-700">
                    <Clock className="h-3.5 w-3.5 mr-1 text-amber-600" />
                    Awaiting review
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
