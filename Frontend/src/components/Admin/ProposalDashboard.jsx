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
  Star,
  Info,
  UserCheck,
  RefreshCw,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { RequestUpdateDialog } from "./RequestUpdateDialog";

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

  const [reviewer1Sent, setReviewer1Sent] = useState(false);
  const [reviewer2Sent, setReviewer2Sent] = useState(false);
  const [sending1Email, setSending1Email] = useState(false);
  const [sending2Email, setSending2Email] = useState(false);
  const [existingReviewers, setExistingReviewers] = useState([]);
  const [reviewer1Expiration, setReviewer1Expiration] = useState(45); // Default 45 days
  const [reviewer2Expiration, setReviewer2Expiration] = useState(45); // Default 45 days
  const [removingReviewer, setRemovingReviewer] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [reviewerToDelete, setReviewerToDelete] = useState(null);
  const [proposalForReviewerDelete, setProposalForReviewerDelete] =
    useState(null);

  const [showAllocationConfirmDialog, setShowAllocationConfirmDialog] =
    useState(false);

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

  const [showUpdateRequestDialog, setShowUpdateRequestDialog] = useState(false);
  const [selectedProposalForUpdate, setSelectedProposalForUpdate] =
    useState(null);

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
      // console.error("Failed to fetch reviewers:", error);
    }
  };

  const openReviewerDetailsDialog = (proposal) => {
    // Match reviewer assignments with the proposal
    const proposalAssignments = reviewAssignments.filter((assignment) => {
      const proposalIdStr = proposal.id.toString();
      const assignmentProposalIdStr = (
        typeof assignment.proposal_id === "object" && assignment.proposal_id._id
          ? assignment.proposal_id._id
          : assignment.proposal_id
      ).toString();

      return proposalIdStr === assignmentProposalIdStr;
    });

    // Prepare reviewer details with marks
    const reviewerDetails = proposal.reviewers.map((reviewer) => {
      // Ensure consistent string ID for comparison
      const reviewerId =
        typeof reviewer.id === "object"
          ? reviewer.id._id?.toString() || reviewer.id.toString()
          : reviewer.id.toString();

      // Initial values from proposal's reviewers array
      let reviewerName = reviewer.name || "";
      let reviewerEmail = reviewer.email || "";

      // First try to find in existingReviewers by ID
      const fullDetailsById = existingReviewers.find(
        (r) => r._id && r._id.toString() === reviewerId
      );

      // Also try by email as fallback
      const fullDetailsByEmail =
        !fullDetailsById && reviewerEmail
          ? existingReviewers.find(
              (r) => r.email.toLowerCase() === reviewerEmail.toLowerCase()
            )
          : null;

      // Use the best data source
      if (fullDetailsById) {
        reviewerName = fullDetailsById.name;
        reviewerEmail = fullDetailsById.email;
      } else if (fullDetailsByEmail) {
        reviewerName = fullDetailsByEmail.name;
        reviewerEmail = fullDetailsByEmail.email;
      }

      // Look for matching assignment
      const assignment = proposalAssignments.find((a) => {
        const assignmentReviewerId =
          typeof a.reviewer_id === "object"
            ? a.reviewer_id._id?.toString() || a.reviewer_id.toString()
            : a.reviewer_id.toString();

        return assignmentReviewerId === reviewerId;
      });

      // Get detailed reviewer info from assignment
      if (assignment && typeof assignment.reviewer_id === "object") {
        if (assignment.reviewer_id.name) {
          reviewerName = assignment.reviewer_id.name;
        }
        if (assignment.reviewer_id.email) {
          reviewerEmail = assignment.reviewer_id.email;
        }
      }

      return {
        id: reviewerId,
        name: reviewerName || "Unknown", // Provide fallback
        email: reviewerEmail || "No email available",
        marks: assignment?.total_mark || null,
        status: assignment?.status || 0,
        markSheetUrl: assignment?.mark_sheet_url || null,
        evaluationSheetUrl: assignment?.evaluation_sheet_url || null,
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
      // console.error("Failed to fetch reviewer assignments:", error);
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
      // console.log(response)

      if (response.data) {
        const { studentProposals, teacherProposals } = response.data;

        // Format proposals with a common structure
        const formattedProposals = [
          ...studentProposals.map((p) => ({
            id: p._id,
            proposalNumber: p.proposal_number,
            title: p.project_title,
            applicant: p.project_director.name_en,
            applicant_email: p.project_director.email,
            applicantType: "Student",
            department: p.department,
            faculty: p.faculty,
            fiscalYear: p.fiscal_year,
            submissionDate: p.createdAt,
            status: p.status,
            totalMarks: p.reviewer_avg_mark || null,
            totalBudget: p.total_budget,
            approvalBudget: p.approval_budget,
            partAPdfUrl: p.pdf_url_part_A,
            partBPdfUrl: p.pdf_url_part_B,
            cgpa: p.cgpa_honours,
            supervisor: p.supervisor,
            reviewers: Array.isArray(p.reviewer)
              ? p.reviewer.map((r) => {
                  const reviewerId =
                    typeof r.id === "object" && r.id.$oid
                      ? r.id.$oid
                      : r.id?._id || r.id;
                  const reviewerDetails = existingReviewers.find(
                    (reviewer) =>
                      reviewer._id.toString() === reviewerId.toString()
                  );

                  // Find matching assignment to get marks and files
                  const assignment = reviewAssignments.find(
                    (a) =>
                      a.reviewer_id._id.toString() === reviewerId.toString() &&
                      a.proposal_id.toString() === p._id.toString()
                  );

                  return {
                    id: reviewerId,
                    name: reviewerDetails?.name || "Unknown",
                    email: reviewerDetails?.email || "",
                    markSheetUrl: assignment?.mark_sheet_url || null,
                    evaluationSheetUrl:
                      assignment?.evaluation_sheet_url || null,
                  };
                })
              : [],
          })),
          ...teacherProposals.map((p) => ({
            id: p._id,
            proposalNumber: p.proposal_number,
            title: p.project_title,
            applicant: p.project_director.name_en,
            applicant_email: p.project_director.email,
            applicantType: "Teacher",
            department: p.department,
            faculty: p.faculty,
            associateInvestigator: p.associate_investigator || null,
            fiscalYear: p.fiscal_year,
            submissionDate: p.createdAt,
            status: p.status,
            totalMarks: p.reviewer_avg_mark || null,
            totalBudget: p.total_budget,
            approvalBudget: p.approval_budget,
            partAPdfUrl: p.pdf_url_part_A,
            partBPdfUrl: p.pdf_url_part_B,
            reviewers: Array.isArray(p.reviewer)
              ? p.reviewer.map((r) => {
                  const reviewerId =
                    typeof r.id === "object" && r.id.$oid
                      ? r.id.$oid
                      : r.id?._id || r.id;
                  const reviewerDetails = existingReviewers.find(
                    (reviewer) =>
                      reviewer._id.toString() === reviewerId.toString()
                  );

                  // Find matching assignment to get marks and files
                  const assignment = reviewAssignments.find(
                    (a) =>
                      a.reviewer_id._id.toString() === reviewerId.toString() &&
                      a.proposal_id.toString() === p._id.toString()
                  );

                  return {
                    id: reviewerId,
                    name: reviewerDetails?.name || "Unknown",
                    email: reviewerDetails?.email || "",
                    markSheetUrl: assignment?.mark_sheet_url || null,
                    evaluationSheetUrl:
                      assignment?.evaluation_sheet_url || null,
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
      // console.error("Failed to fetch proposals:", error);
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
        if (newStatus === 3 && allocatedBudget) {
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
                  approvalBudget: allocatedBudget || p.totalBudget,
                }
              : p
          )
        );

        // Update statistics
        fetchProposals();
      }
    } catch (error) {
      // console.error("Failed to update proposal status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Handle allocation submission
  const handleAllocation = () => {
    if (!selectedProposalForAllocation || !allocatedAmount) {
      toast.error("Please enter an allocation amount");
      return;
    }
    setShowAllocationDialog(false);
    setShowAllocationConfirmDialog(true);
  };

  const confirmAllocation = () => {
    try {
      api
        .post("/api/admin/research-proposal/approval-budget", {
          proposal_id: selectedProposalForAllocation.id,
          proposal_type:
            selectedProposalForAllocation.applicantType.toLowerCase(),
          approval_budget: parseFloat(allocatedAmount),
        })
        .then(() => {
          updateProposalStatus(
            selectedProposalForAllocation,
            3,
            parseFloat(allocatedAmount)
          );

          setShowAllocationConfirmDialog(false);
          setSelectedProposalForAllocation(null);
          setAllocatedAmount("");

          toast.success("Budget allocated successfully");

          // Refresh proposals
          fetchProposals();
        });
    } catch (error) {
      // console.error("Failed to allocate budget:", error);
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
      // console.error("Failed to delete proposal:", error);
      toast.error(error.response?.data?.message || "Failed to delete proposal");
    }
  };

  const assignReviewer1 = async (proposal) => {
    if (!reviewerName1 || !reviewerEmail1) {
      toast.error("Please enter reviewer 1 details");
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(reviewerEmail1)) {
      toast.error("Please enter a valid email address for reviewer 1");
      return;
    }

    // Validate expiration days
    if (
      !reviewer1Expiration ||
      reviewer1Expiration === "" ||
      parseInt(reviewer1Expiration) < 1
    ) {
      toast.error("Please enter a valid expiration period (minimum 1 day)");
      return;
    }

    try {
      setSending1Email(true);

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
          // Add to existing reviewers immediately
          setExistingReviewers((prev) => [
            ...prev,
            newReviewer1Res.data.reviewer,
          ]);
        } else {
          throw new Error("Failed to create reviewer 1");
        }
      }

      // Send first reviewer invitation
      await api.post("/api/admin/research-proposal/sent-to-reviewer", {
        proposal_id: proposal.id,
        proposal_type: proposal.applicantType.toLowerCase(),
        reviewer_id: reviewer1Id,
        expiresIn: reviewer1Expiration,
      });

      toast.success("Invitation sent to Reviewer 1");
      setReviewer1Sent(true);
      setReviewer1Expiration(45);

      // Update the proposal in the local state - add reviewer1
      setProposals((prevProposals) =>
        prevProposals.map((p) =>
          p.id === proposal.id
            ? {
                ...p,
                reviewers: [
                  ...(p.reviewers || []),
                  {
                    id: reviewer1Id,
                    name: reviewerName1,
                    email: reviewerEmail1,
                    expiresIn: reviewer1Expiration,
                  },
                ],
                status: 1, // Set to "Under Review"
              }
            : p
        )
      );

      // Fetch reviewer assignments to update status info
      fetchReviewerAssignments();
    } catch (error) {
      // console.error("Failed to assign reviewer 1:", error);
      toast.error(
        error.response?.data?.message || "Failed to assign reviewer 1"
      );
    } finally {
      setSending1Email(false);
    }
  };

  const assignReviewer2 = async (proposal) => {
    if (!reviewerName2 || !reviewerEmail2) {
      toast.error("Please enter reviewer 2 details");
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(reviewerEmail2)) {
      toast.error("Please enter a valid email address for reviewer 2");
      return;
    }

    // Validate expiration days
    if (
      !reviewer2Expiration ||
      reviewer2Expiration === "" ||
      parseInt(reviewer2Expiration) < 1
    ) {
      toast.error("Please enter a valid expiration period (minimum 1 day)");
      return;
    }

    // Check if we're trying to use the same email as reviewer 1 (if it exists)
    if (
      proposal.reviewers &&
      proposal.reviewers.length > 0 &&
      proposal.reviewers[0].email.toLowerCase() === reviewerEmail2.toLowerCase()
    ) {
      toast.error("Cannot assign the same reviewer twice");
      return;
    }

    try {
      setSending2Email(true);

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
          // Add to existing reviewers immediately
          setExistingReviewers((prev) => [
            ...prev,
            newReviewer2Res.data.reviewer,
          ]);
        } else {
          throw new Error("Failed to create reviewer 2");
        }
      }

      // Send second reviewer invitation
      await api.post("/api/admin/research-proposal/sent-to-reviewer", {
        proposal_id: proposal.id,
        proposal_type: proposal.applicantType.toLowerCase(),
        reviewer_id: reviewer2Id,
        expiresIn: reviewer2Expiration,
      });

      toast.success("Invitation sent to Reviewer 2");
      setReviewer2Sent(true);
      setReviewer2Expiration(45);

      // Update the proposal in the local state - add reviewer2
      setProposals((prevProposals) =>
        prevProposals.map((p) =>
          p.id === proposal.id
            ? {
                ...p,
                reviewers: [
                  ...(p.reviewers || []), // This will include the first reviewer if they exist
                  {
                    id: reviewer2Id,
                    name: reviewerName2,
                    email: reviewerEmail2,
                    expiresIn: reviewer2Expiration,
                  },
                ],
                status: 1, // Keep status as "Under Review"
              }
            : p
        )
      );

      // Fetch assignments to update UI
      fetchReviewerAssignments();
    } catch (error) {
      // console.error("Failed to assign reviewer 2:", error);
      toast.error(
        error.response?.data?.message || "Failed to assign reviewer 2"
      );
    } finally {
      setSending2Email(false);
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

      if (key === "cgpa") {
        // Only student proposals have CGPA
        const aCgpa = a.applicantType === "Student" ? Number(a.cgpa) || 0 : 0;
        const bCgpa = b.applicantType === "Student" ? Number(b.cgpa) || 0 : 0;

        return sortConfig.direction === "asc" ? aCgpa - bCgpa : bCgpa - aCgpa;
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

  const removeReviewer = async (proposal, reviewer) => {
    if (!reviewerToDelete || !proposalForReviewerDelete) return;
    try {
      setRemovingReviewer(true);

      // Call the API to remove the reviewer assignment
      await api.post("/api/admin/research-proposal/reviewer/remove", {
        reviewer_id: reviewerToDelete.id,
        proposal_id: proposalForReviewerDelete.id,
        proposal_type: proposalForReviewerDelete.applicantType.toLowerCase(),
      });

      // Update local state by removing the reviewer from the proposal
      setProposals((prevProposals) =>
        prevProposals.map((p) => {
          if (p.id === proposalForReviewerDelete.id) {
            return {
              ...p,
              reviewers: p.reviewers.filter(
                (r) => r.id !== reviewerToDelete.id
              ),
              // If no reviewers left, reset status to 0 (pending)
              status: p.reviewers.length === 1 ? 0 : p.status,
            };
          }
          return p;
        })
      );

      // Update selected proposal reviewers if needed
      if (
        selectedProposalReviewers &&
        selectedProposalReviewers.proposal.id === proposalForReviewerDelete.id
      ) {
        setSelectedProposalReviewers({
          ...selectedProposalReviewers,
          reviewers: selectedProposalReviewers.reviewers.filter(
            (r) => r.id !== reviewerToDelete.id
          ),
        });
      }

      // Fetch the latest assignments to update UI
      fetchReviewerAssignments();

      toast.success("Reviewer removed successfully");

      setShowDeleteConfirmDialog(false);

      // If removing from the assign reviewers dialog, close it and reset fields if no reviewers left
      if (!showReviewerDetailsDialog) {
        // Find the updated proposal
        const updatedProposal = proposals.find(
          (p) => p.id === proposalForReviewerDelete.id
        );
        const reviewersLeft =
          updatedProposal?.reviewers?.filter(
            (r) => r.id !== reviewerToDelete.id
          ).length || 0;

        if (reviewersLeft === 0) {
          // Reset reviewer fields
          setReviewerName1("");
          setReviewerEmail1("");
          setReviewer1Sent(false);
          setReviewer1Expiration(45);
          setReviewerName2("");
          setReviewerEmail2("");
          setReviewer2Sent(false);
          setReviewer2Expiration(45);
          // Close the dialog
          document.querySelector("dialog")?.close();
        } else {
          document.querySelector("dialog")?.close();
        }
      } else {
        // Close the main dialog if removing from the reviewer details dialog
        setShowReviewerDetailsDialog(false);
      }

      // Reset state
      setReviewerToDelete(null);
      setProposalForReviewerDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove reviewer");
    } finally {
      setRemovingReviewer(false);
    }
  };

  // Add a function to open the delete confirmation dialog
  const confirmRemoveReviewer = (proposal, reviewer) => {
    setReviewerToDelete(reviewer);
    setProposalForReviewerDelete(proposal);
    setShowDeleteConfirmDialog(true);
  };

  const handleRequestUpdate = (proposal) => {
    setSelectedProposalForUpdate(proposal);
    setShowUpdateRequestDialog(true);
  };

  const handleUpdateRequestSuccess = () => {
    fetchProposals();
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
            Avg. Score
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
          {proposals.some((p) => p.applicantType === "Student") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("cgpa")}
              className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              CGPA
              {sortConfig.key === "cgpa" &&
                (sortConfig.direction === "asc" ? (
                  <ChevronUp className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-1" />
                ))}
            </Button>
          )}
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
              <TableHead>Avg. Score</TableHead>
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Info className="h-4 w-4 text-slate-500" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4">
                          {proposal.applicantType === "Teacher" ? (
                            <>
                              <h4 className="font-medium text-sm mb-2 flex items-center">
                                <UserCheck className="h-4 w-4 mr-2 text-purple-600" />
                                Associate Director
                              </h4>
                              {proposal.associateInvestigator ? (
                                <div className="text-sm text-slate-700 dark:text-slate-300">
                                  {proposal.associateInvestigator}
                                </div>
                              ) : (
                                <div className="text-sm text-slate-500 italic">
                                  No associate director specified
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <h4 className="font-medium text-sm mb-2 flex items-center">
                                <UserCheck className="h-4 w-4 mr-2 text-blue-600" />
                                Supervisor Information
                              </h4>
                              {proposal.supervisor ? (
                                <div className="space-y-1">
                                  <div className="text-sm">
                                    <span className="font-medium">Name:</span>{" "}
                                    {proposal.supervisor.name}
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">
                                      Designation:
                                    </span>{" "}
                                    {proposal.supervisor.designation}
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">
                                      Department:
                                    </span>{" "}
                                    {proposal.supervisor.department}
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">
                                      Faculty:
                                    </span>{" "}
                                    {proposal.supervisor.faculty}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-slate-500 italic">
                                  No supervisor information available
                                </div>
                              )}
                            </>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{proposal.department}</span>
                      {proposal.applicantType === "Student" &&
                        proposal.cgpa && (
                          <Badge
                            variant="outline"
                            className="bg-cyan-50 text-cyan-800 border-cyan-200 mt-1 self-start"
                          >
                            CGPA: {proposal.cgpa}
                          </Badge>
                        )}
                    </div>
                  </TableCell>
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
                      {proposal.reviewers && proposal.reviewers.length < 2 ? (
                        <Dialog>
                          <DialogTrigger
                            asChild
                            onClick={() => {
                              // Reset states for whichever reviewer needs to be assigned
                              if (proposal.reviewers.length === 0) {
                                // Reset both reviewers
                                setReviewer1Sent(false);
                                setReviewerName1("");
                                setReviewerEmail1("");
                              } else {
                                // For the existing reviewer, populate the information from the existing assignment
                                const reviewer = proposal.reviewers[0];

                                // Find the full reviewer details from existing reviewers or assignments
                                const existingReviewerData =
                                  existingReviewers.find(
                                    (r) =>
                                      r._id &&
                                      reviewer.id &&
                                      (r._id.toString() ===
                                        reviewer.id.toString() ||
                                        r.email.toLowerCase() ===
                                          reviewer.email?.toLowerCase())
                                  );

                                // Find matching assignment to display status
                                const assignment = reviewAssignments.find(
                                  (a) =>
                                    a.proposal_id &&
                                    proposal.id &&
                                    a.proposal_id.toString() ===
                                      proposal.id.toString() &&
                                    a.reviewer_id &&
                                    reviewer.id &&
                                    a.reviewer_id._id.toString() ===
                                      reviewer.id.toString()
                                );

                                setReviewer1Sent(true);
                                // Use the best available name and email
                                setReviewerName1(
                                  existingReviewerData?.name ||
                                    reviewer.name ||
                                    "Unknown"
                                );
                                setReviewerEmail1(
                                  existingReviewerData?.email ||
                                    reviewer.email ||
                                    ""
                                );
                              }

                              setReviewer2Sent(false);
                              setReviewerName2("");
                              setReviewerEmail2("");

                              // Fetch the latest reviewer assignments
                              fetchReviewerAssignments();
                            }}
                          >
                            <Button
                              variant="outline"
                              size="icon"
                              title={
                                proposal.reviewers.length === 0
                                  ? "Assign Reviewers"
                                  : "Assign Second Reviewer"
                              }
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {proposal.reviewers.length === 0
                                  ? "Assign Reviewers"
                                  : "Assign Second Reviewer"}
                              </DialogTitle>
                              <DialogDescription>
                                {proposal.reviewers.length === 0
                                  ? "Send this proposal to two reviewers for evaluation."
                                  : "Assign a second reviewer to this proposal."}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              {proposal.reviewers.length === 0 ? (
                                <>
                                  {/* First reviewer form */}
                                  <div>
                                    <h3 className="text-sm font-medium mb-2 flex items-center">
                                      <User className="h-4 w-4 mr-2 text-emerald-600" />
                                      Reviewer 1
                                    </h3>
                                    <div className="grid gap-2 mt-2">
                                      <Label htmlFor="reviewer1Email">
                                        Email
                                      </Label>
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
                                            setReviewerName1(
                                              matchingReviewer.name
                                            );
                                          } else {
                                            setReviewerName1("");
                                          }
                                        }}
                                        disabled={reviewer1Sent}
                                      />
                                    </div>
                                    <div className="grid gap-2 mt-2">
                                      <Label htmlFor="reviewer1Name">
                                        Name
                                      </Label>
                                      <Input
                                        id="reviewer1Name"
                                        placeholder="Reviewer's full name"
                                        value={reviewerName1}
                                        onChange={(e) =>
                                          setReviewerName1(e.target.value)
                                        }
                                        disabled={
                                          reviewer1Sent ||
                                          reviewerEmail1 === "" ||
                                          existingReviewers?.some(
                                            (r) =>
                                              r.email.toLowerCase() ===
                                              reviewerEmail1.toLowerCase()
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2 mt-2">
                                      <Label htmlFor="reviewer1Expiration">
                                        Expires In (Days)
                                      </Label>
                                      <Input
                                        id="reviewer1Expiration"
                                        type="number"
                                        min="1"
                                        max="90"
                                        placeholder="Days until expiration"
                                        value={
                                          reviewer1Expiration === 0
                                            ? ""
                                            : reviewer1Expiration
                                        }
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setReviewer1Expiration(
                                            value === ""
                                              ? ""
                                              : parseInt(value, 10)
                                          );
                                        }}
                                        disabled={reviewer1Sent}
                                      />
                                    </div>

                                    <div className="mt-2 flex justify-end">
                                      {reviewer1Sent ? (
                                        <div className="flex items-center text-green-600">
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          <span className="text-sm">
                                            Invitation sent
                                          </span>
                                        </div>
                                      ) : (
                                        <Button
                                          onClick={() =>
                                            assignReviewer1(proposal)
                                          }
                                          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                                          disabled={
                                            !reviewerName1 ||
                                            !reviewerEmail1 ||
                                            sending1Email
                                          }
                                          size="sm"
                                        >
                                          {sending1Email ? (
                                            <>
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                              Sending...
                                            </>
                                          ) : (
                                            <>
                                              <Mail className="h-3 w-3" />
                                              Send Invitation
                                            </>
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  <Separator className="my-2" />
                                </>
                              ) : (
                                <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mb-2">
                                  <h3 className="text-sm font-medium mb-1 flex items-center">
                                    <User className="h-4 w-4 mr-2 text-blue-600" />
                                    Reviewer 1 (Already Assigned)
                                  </h3>

                                  {/* Access reviewer data from the proposal or state depending on what's available */}
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm text-blue-700">
                                        {reviewerName1 ||
                                          proposal.reviewers[0]?.name ||
                                          "Unknown"}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {reviewerEmail1 ||
                                          proposal.reviewers[0]?.email ||
                                          "Email not available"}
                                      </p>

                                      {/* Add status indicator for first reviewer */}
                                      {(() => {
                                        const reviewerIdStr =
                                          typeof proposal.reviewers[0].id ===
                                          "object"
                                            ? proposal.reviewers[0].id._id?.toString() ||
                                              proposal.reviewers[0].id.toString()
                                            : proposal.reviewers[0].id.toString();

                                        // Find the matching assignment checking both reviewer ID and proposal ID
                                        const assignment =
                                          reviewAssignments.find((a) => {
                                            const assignmentReviewerIdStr =
                                              typeof a.reviewer_id === "object"
                                                ? a.reviewer_id._id?.toString() ||
                                                  a.reviewer_id.toString()
                                                : a.reviewer_id.toString();

                                            const assignmentProposalIdStr =
                                              typeof a.proposal_id === "object"
                                                ? a.proposal_id._id?.toString() ||
                                                  a.proposal_id.toString()
                                                : a.proposal_id.toString();

                                            return (
                                              reviewerIdStr ===
                                                assignmentReviewerIdStr &&
                                              proposal.id.toString() ===
                                                assignmentProposalIdStr
                                            );
                                          });

                                        if (
                                          assignment &&
                                          assignment.status === 1
                                        ) {
                                          return (
                                            <>
                                              <div className="mt-1 flex items-center text-green-600 text-xs">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                <span>Review submitted</span>
                                              </div>
                                              {assignment.total_mark && (
                                                <div className="mt-1 flex items-center text-blue-600 text-xs">
                                                  <Star className="h-3 w-3 mr-1" />
                                                  <span>
                                                    Marks:{" "}
                                                    {assignment.total_mark}
                                                    /100
                                                  </span>
                                                </div>
                                              )}
                                              {/* Marksheet button */}
                                              {assignment.mark_sheet_url &&
                                                assignment.mark_sheet_url !==
                                                  "/" && (
                                                  <div className="mt-1">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="text-xs p-0 h-auto text-blue-600 hover:text-blue-800"
                                                      onClick={() => {
                                                        const baseUrl =
                                                          import.meta.env
                                                            .VITE_API_URL || "";
                                                        const serverRoot =
                                                          baseUrl.replace(
                                                            /\/v1$/,
                                                            ""
                                                          );
                                                        const fileUrl = `${serverRoot}/${assignment.mark_sheet_url}`;
                                                        window.open(
                                                          fileUrl,
                                                          "_blank"
                                                        );
                                                      }}
                                                    >
                                                      <Download className="h-3 w-3 mr-1" />
                                                      <span>
                                                        View marksheet
                                                      </span>
                                                    </Button>
                                                  </div>
                                                )}
                                              {/* Add evaluation sheet button */}
                                              {assignment.evaluation_sheet_url &&
                                                assignment.evaluation_sheet_url !==
                                                  "/" && (
                                                  <div className="mt-1">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="text-xs p-0 h-auto text-green-600 hover:text-green-800"
                                                      onClick={() => {
                                                        const baseUrl =
                                                          import.meta.env
                                                            .VITE_API_URL || "";
                                                        const serverRoot =
                                                          baseUrl.replace(
                                                            /\/v1$/,
                                                            ""
                                                          );
                                                        const fileUrl = `${serverRoot}/${assignment.evaluation_sheet_url}`;
                                                        window.open(
                                                          fileUrl,
                                                          "_blank"
                                                        );
                                                      }}
                                                    >
                                                      <Download className="h-3 w-3 mr-1" />
                                                      <span>
                                                        View Proposal Review
                                                        Form
                                                      </span>
                                                    </Button>
                                                  </div>
                                                )}
                                            </>
                                          );
                                        }
                                        return (
                                          <div className="mt-1 flex items-center text-amber-600 text-xs">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>Pending review</span>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                    {/* delete button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                                      title="Remove reviewer"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent dialog from closing
                                        // Get the best available name/email for reviewer 1
                                        const reviewer = proposal.reviewers[0];
                                        const existingReviewerData =
                                          existingReviewers.find(
                                            (r) =>
                                              r._id &&
                                              reviewer.id &&
                                              (r._id.toString() ===
                                                reviewer.id.toString() ||
                                                r.email.toLowerCase() ===
                                                  reviewer.email?.toLowerCase())
                                          );
                                        confirmRemoveReviewer(proposal, {
                                          ...reviewer,
                                          name:
                                            existingReviewerData?.name ||
                                            reviewer.name ||
                                            "Unknown",
                                          email:
                                            existingReviewerData?.email ||
                                            reviewer.email ||
                                            "",
                                        });
                                      }}
                                      disabled={
                                        removingReviewer ||
                                        // Check if review is already submitted
                                        reviewAssignments.some(
                                          (a) =>
                                            a.reviewer_id._id?.toString() ===
                                              proposal.reviewers[0].id.toString() &&
                                            a.proposal_id.toString() ===
                                              proposal.id.toString() &&
                                            a.status === 1
                                        )
                                      }
                                    >
                                      {removingReviewer ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Second reviewer form */}
                              <div>
                                <h3 className="text-sm font-medium mb-2 flex items-center">
                                  <User className="h-4 w-4 mr-2 text-emerald-600" />
                                  {proposal.reviewers.length === 0
                                    ? "Reviewer 2"
                                    : "Reviewer 2 (Required)"}
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
                                    disabled={reviewer2Sent}
                                  />
                                </div>
                                <div className="grid gap-2 mt-2">
                                  <Label htmlFor="reviewer2Name">Name</Label>
                                  <Input
                                    id="reviewer2Name"
                                    placeholder="Reviewer's full name"
                                    value={reviewerName2}
                                    onChange={(e) =>
                                      setReviewerName2(e.target.value)
                                    }
                                    disabled={
                                      reviewer2Sent ||
                                      reviewerEmail2 === "" ||
                                      existingReviewers?.some(
                                        (r) =>
                                          r.email.toLowerCase() ===
                                          reviewerEmail2.toLowerCase()
                                      )
                                    }
                                  />
                                </div>
                                <div className="grid gap-2 mt-2">
                                  <Label htmlFor="reviewer2Expiration">
                                    Expires In (Days)
                                  </Label>
                                  <Input
                                    id="reviewer2Expiration"
                                    type="number"
                                    min="1"
                                    max="90"
                                    placeholder="Days until expiration"
                                    value={
                                      reviewer2Expiration === 0
                                        ? ""
                                        : reviewer2Expiration
                                    }
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setReviewer2Expiration(
                                        value === "" ? "" : parseInt(value, 10)
                                      );
                                    }}
                                    disabled={reviewer2Sent}
                                  />
                                </div>

                                {/* Warning if trying to assign same reviewer twice */}
                                {proposal.reviewers?.length > 0 &&
                                  reviewerEmail2 &&
                                  proposal.reviewers[0]?.email?.toLowerCase() ===
                                    reviewerEmail2?.toLowerCase() && (
                                    <div className="mt-2 text-red-500 text-sm flex items-center">
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      Cannot assign the same reviewer twice
                                    </div>
                                  )}

                                <div className="mt-2 flex justify-end">
                                  {reviewer2Sent ? (
                                    <div className="flex items-center text-green-600">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      <span className="text-sm">
                                        Invitation sent
                                      </span>
                                    </div>
                                  ) : (
                                    <Button
                                      onClick={() => assignReviewer2(proposal)}
                                      className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                                      disabled={
                                        !reviewerName2 ||
                                        !reviewerEmail2 ||
                                        sending2Email ||
                                        (proposal.reviewers?.length > 0 &&
                                          proposal.reviewers[0]?.email?.toLowerCase() ===
                                            reviewerEmail2?.toLowerCase())
                                      }
                                      size="sm"
                                    >
                                      {sending2Email ? (
                                        <>
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                          Sending...
                                        </>
                                      ) : (
                                        <>
                                          <Mail className="h-3 w-3" />
                                          Send Invitation
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : proposal.status === 3 ? (
                        <Button
                          variant="outline"
                          size="icon"
                          title="View Allocation Details"
                          className="bg-green-50 hover:bg-green-100"
                          onClick={() => openReviewerDetailsDialog(proposal)}
                        >
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </Button>
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
                      <div className="flex gap-2">
                        {/* Only show the Allocate button - other statuses should be automatic */}
                        {proposal.status !== 3 && proposal.status === 2 && (
                          <Button
                            variant="outline"
                            size="icon"
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
                            <DollarSign className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700"
                        title="Request Updates"
                        onClick={() => handleRequestUpdate(proposal)}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>

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

      {/* Allocation Confirmation Dialog */}
      <Dialog
        open={showAllocationConfirmDialog}
        onOpenChange={setShowAllocationConfirmDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Budget Allocation</DialogTitle>
            <DialogDescription>
              Are you sure you want to allocate the following budget?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <h3 className="font-medium text-sm mb-1">
                {selectedProposalForAllocation?.title}
              </h3>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Applicant:</span>
                  <p className="font-medium">
                    {selectedProposalForAllocation?.applicant}
                  </p>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    Requested Budget:
                  </span>
                  <p className="font-medium">
                    BDT {selectedProposalForAllocation?.totalBudget}
                  </p>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Allocating:</span>
                  <p className="font-bold text-green-600">
                    BDT {allocatedAmount}
                  </p>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Review Score:</span>
                  <p className="font-medium">
                    {selectedProposalForAllocation?.totalMarks || "N/A"}/100
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAllocationConfirmDialog(false);
                setShowAllocationDialog(true); // Go back to allocation dialog
              }}
            >
              Back
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmAllocation}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Allocation
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
            <DialogTitle>
              {selectedProposalReviewers?.proposal.status === 3
                ? "Allocation Details"
                : "Assigned Reviewers"}
            </DialogTitle>
            <DialogDescription>
              {selectedProposalReviewers?.proposal.status === 3
                ? "This proposal has been funded with allocated budget and reviewer evaluations."
                : "Reviewers assigned to this proposal and their evaluation status."}
            </DialogDescription>
          </DialogHeader>

          {/* Show allocated budget section if status is 3 */}
          {selectedProposalReviewers?.proposal.status === 3 && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  <span className="font-medium">Allocation Details</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  Funded
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Requested Budget:
                  </p>
                  <p className="text-md font-medium">
                    BDT {selectedProposalReviewers?.proposal.totalBudget}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Allocated Budget:
                  </p>
                  <p className="text-md font-bold text-green-700">
                    BDT {selectedProposalReviewers?.proposal.approvalBudget}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Allocated on {formatDate(new Date())}
              </p>
            </div>
          )}

          <div className="space-y-4 py-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Reviewer Evaluations
            </h3>
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
                  <div className="flex items-center gap-2">
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                      title="Remove reviewer"
                      onClick={() =>
                        confirmRemoveReviewer(
                          selectedProposalReviewers.proposal,
                          reviewer
                        )
                      }
                      disabled={removingReviewer || reviewer.status === 1}
                    >
                      {removingReviewer ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
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
                    {reviewer.markSheetUrl && reviewer.markSheetUrl !== "/" && (
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
                    {reviewer.evaluationSheetUrl &&
                      reviewer.evaluationSheetUrl !== "/" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs mt-1 w-full border-blue-200"
                          onClick={() => {
                            const baseUrl = import.meta.env.VITE_API_URL || "";
                            const serverRoot = baseUrl.replace(/\/v1$/, "");
                            const fileUrl = `${serverRoot}/${reviewer.evaluationSheetUrl}`;
                            window.open(fileUrl, "_blank");
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" /> View Proposal
                          Review
                        </Button>
                      )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm flex items-center text-amber-700">
                      <Clock className="h-3.5 w-3.5 mr-1 text-amber-600" />
                      Pending review
                    </div>
                    {reviewer.expiresIn && (
                      <div className="text-xs text-muted-foreground">
                        Expires in: {reviewer.expiresIn} days
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviewer Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Reviewer Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this reviewer from the proposal?
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md my-2">
            <p className="text-sm font-medium">
              <span className="text-muted-foreground">Reviewer:</span>{" "}
              {reviewerToDelete?.name || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {reviewerToDelete?.email || "No email available"}
            </p>
          </div>
          <DialogFooter className="flex justify-end gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={removeReviewer}
              disabled={removingReviewer}
              className="flex items-center gap-2"
            >
              {removingReviewer ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove Reviewer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RequestUpdateDialog
        proposal={selectedProposalForUpdate}
        isOpen={showUpdateRequestDialog}
        onClose={() => setShowUpdateRequestDialog(false)}
        onSuccess={handleUpdateRequestSuccess}
      />
    </div>
  );
}
