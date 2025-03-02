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

export default function ProposalsDashboard() {
  // States
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "submissionDate",
    direction: "desc",
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    pending_review: 0,
    reviewed: 0,
    student: 0,
    teacher: 0,
  });
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [reviewerEmail1, setReviewerEmail1] = useState("");
  const [reviewerName1, setReviewerName1] = useState("");
  const [reviewerEmail2, setReviewerEmail2] = useState("");
  const [reviewerName2, setReviewerName2] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeDocumentTab, setActiveDocumentTab] = useState("partB");
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    fiscalYears: [],
    applicantTypes: ["student", "teacher"],
  });
  const [filters, setFilters] = useState({
    status: "all",
    department: "all",
    fiscalYear: "all",
    applicantType: "all",
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Fetch proposal
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        // API endpoint would be used here when backend is ready
        // const response = await fetch("/api/admin/proposals");
        // const data = await response.json();
        // setProposals(data);
        // setFilteredProposals(data);
        // calculateStatistics(data);
        // setLoading(false);
      } catch (error) {
        console.error("Failed to fetch proposals:", error);
        toast.error("Failed to load proposals");
        setLoading(false);
      }
    };

    // Mock data for development
    const mockProposals = [
      {
        id: 1,
        title: "Development of Sustainable Agriculture Practices",
        applicant: "Dr. Jane Smith",
        applicantType: "teacher",
        department: "Agriculture Science",
        submissionDate: "2024-02-15",
        fiscalYear: "2023-2024",
        status: "pending",
        reviewers: [],
        totalMarks: null,
        partAPdfUrl: "/files/proposal1_partA.pdf",
        partBPdfUrl: "/files/proposal1_partB.pdf",
      },
      {
        id: 2,
        title: "AI-Based Traffic Management System",
        applicant: "Dr. Robert Johnson",
        applicantType: "teacher",
        department: "Computer Science",
        submissionDate: "2024-02-10",
        fiscalYear: "2023-2024",
        status: "pending_review",
        reviewers: [
          {
            name: "Dr. Alan Turing",
            email: "reviewer1@example.com",
            marksGiven: null,
          },
          {
            name: "Dr. Ada Lovelace",
            email: "reviewer2@example.com",
            marksGiven: null,
          },
        ],
        totalMarks: null,
        partAPdfUrl: "/files/proposal2_partA.pdf",
        partBPdfUrl: "/files/proposal2_partB.pdf",
      },
      {
        id: 3,
        title: "Nanomaterial Applications in Cancer Treatment",
        applicant: "Sarah Williams",
        applicantType: "student",
        department: "Medical Sciences",
        submissionDate: "2024-02-05",
        fiscalYear: "2023-2024",
        status: "reviewed",
        reviewers: [
          {
            name: "Dr. Marie Curie",
            email: "reviewer3@example.com",
            marksGiven: 48,
          },
          {
            name: "Dr. Louis Pasteur",
            email: "reviewer4@example.com",
            marksGiven: 45,
          },
        ],
        totalMarks: 93,
        partAPdfUrl: "/files/proposal3_partA.pdf",
        partBPdfUrl: "/files/proposal3_partB.pdf",
      },
      {
        id: 4,
        title: "Machine Learning for Climate Change Prediction",
        applicant: "Dr. Michael Chen",
        applicantType: "teacher",
        department: "Environmental Science",
        submissionDate: "2024-01-28",
        fiscalYear: "2022-2023",
        status: "reviewed",
        reviewers: [
          {
            name: "Dr. Rachel Carson",
            email: "reviewer1@example.com",
            marksGiven: 30,
          },
          {
            name: "Dr. James Hansen",
            email: "reviewer5@example.com",
            marksGiven: 25,
          },
        ],
        totalMarks: 55,
        partAPdfUrl: "/files/proposal4_partA.pdf",
        partBPdfUrl: "/files/proposal4_partB.pdf",
      },
      {
        id: 5,
        title: "Biodiversity Conservation in Urban Areas",
        applicant: "Ahmed Khan",
        applicantType: "student",
        department: "Environmental Science",
        submissionDate: "2024-01-15",
        fiscalYear: "2022-2023",
        status: "pending_review",
        reviewers: [
          {
            name: "Dr. David Attenborough",
            email: "reviewer6@example.com",
            marksGiven: null,
          },
          {
            name: "Dr. Jane Goodall",
            email: "reviewer7@example.com",
            marksGiven: null,
          },
        ],
        totalMarks: null,
        partAPdfUrl: "/files/proposal5_partA.pdf",
        partBPdfUrl: "/files/proposal5_partB.pdf",
      },
      {
        id: 6,
        title: "Advanced Materials for Solar Energy Harvesting",
        applicant: "Maria Rodriguez",
        applicantType: "student",
        department: "Physics",
        submissionDate: "2024-03-05",
        fiscalYear: "2023-2024",
        status: "pending",
        reviewers: [],
        totalMarks: null,
        partAPdfUrl: "/files/proposal6_partA.pdf",
        partBPdfUrl: "/files/proposal6_partB.pdf",
      },
    ];

    setProposals(mockProposals);
    setFilteredProposals(mockProposals);

    // Extract unique filter options
    const departments = [...new Set(mockProposals.map((p) => p.department))];
    const fiscalYears = [...new Set(mockProposals.map((p) => p.fiscalYear))];

    setFilterOptions({
      departments,
      fiscalYears,
      applicantTypes: ["student", "teacher"],
    });

    calculateStatistics(mockProposals);
    setLoading(false);

    // Uncomment to use actual API when backend is ready
    // fetchProposals();
  }, []);

  // Calculate statistics from proposals data
  const calculateStatistics = (proposalsData) => {
    const stats = {
      total: proposalsData.length,
      pending: proposalsData.filter((p) => p.status === "pending").length,
      pending_review: proposalsData.filter((p) => p.status === "pending_review")
        .length,
      reviewed: proposalsData.filter((p) => p.status === "reviewed").length,
      student: proposalsData.filter((p) => p.applicantType === "student")
        .length,
      teacher: proposalsData.filter((p) => p.applicantType === "teacher")
        .length,
    };

    setStatistics(stats);
  };

  // Apply all filters
  useEffect(() => {
    let results = proposals;

    // Search filter
    if (searchQuery) {
      results = results.filter(
        (proposal) =>
          proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proposal.applicant
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          proposal.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "all") {
      results = results.filter((p) => p.status === filters.status);
    }

    // Department filter
    if (filters.department !== "all") {
      results = results.filter((p) => p.department === filters.department);
    }

    // Fiscal year filter
    if (filters.fiscalYear !== "all") {
      results = results.filter((p) => p.fiscalYear === filters.fiscalYear);
    }

    // Applicant type filter
    if (filters.applicantType !== "all") {
      results = results.filter(
        (p) => p.applicantType === filters.applicantType
      );
    }

    setFilteredProposals(results);
  }, [searchQuery, proposals, filters]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "all",
      department: "all",
      fiscalYear: "all",
      applicantType: "all",
    });
    setFiltersExpanded(false);
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedProposals = [...filteredProposals].sort((a, b) => {
      if (key === "submissionDate") {
        // For dates
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        // For other fields
        if (a[key] === null) return direction === "asc" ? 1 : -1;
        if (b[key] === null) return direction === "asc" ? -1 : 1;

        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      }
    });

    setFilteredProposals(sortedProposals);
  };

  // Assign reviewers
  const assignReviewers = async () => {
    if (!selectedProposal) return;
    if (
      !reviewerEmail1 ||
      !reviewerName1 ||
      !reviewerEmail2 ||
      !reviewerName2
    ) {
      toast.error("Please enter both reviewers' names and emails");
      return;
    }

    try {
      // Replace with actual API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update proposal with reviewers
      const updatedProposals = proposals.map((p) => {
        if (p.id === selectedProposal.id) {
          return {
            ...p,
            reviewers: [
              { name: reviewerName1, email: reviewerEmail1, marksGiven: null },
              { name: reviewerName2, email: reviewerEmail2, marksGiven: null },
            ],
            status: "pending_review",
          };
        }
        return p;
      });

      setProposals(updatedProposals);
      setFilteredProposals(updatedProposals);
      calculateStatistics(updatedProposals);

      toast.success("Reviewers assigned and emails sent successfully");
      setReviewerName1("");
      setReviewerEmail1("");
      setReviewerName2("");
      setReviewerEmail2("");
      setSelectedProposal(null);
    } catch (error) {
      console.error("Failed to assign reviewers:", error);
      toast.error("Failed to assign reviewers");
    }
  };

  // Update proposal marks
  const updateProposalMarks = async (
    proposalId,
    reviewer1Marks,
    reviewer2Marks
  ) => {
    if (!reviewer1Marks || !reviewer2Marks) {
      toast.error("Please enter marks for both reviewers");
      return;
    }

    try {
      const totalMarks = parseInt(reviewer1Marks) + parseInt(reviewer2Marks);
      const status = "reviewed";

      // Replace with actual API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update proposal with marks
      const updatedProposals = proposals.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            reviewers: [
              { ...p.reviewers[0], marksGiven: parseInt(reviewer1Marks) },
              { ...p.reviewers[1], marksGiven: parseInt(reviewer2Marks) },
            ],
            totalMarks,
            status,
          };
        }
        return p;
      });

      setProposals(updatedProposals);
      setFilteredProposals(updatedProposals);
      calculateStatistics(updatedProposals);

      toast.success("Proposal marks updated");
    } catch (error) {
      console.error("Failed to update marks:", error);
      toast.error("Failed to update marks");
    }
  };

  // Delete proposal
  const deleteProposal = async (proposalId) => {
    try {
      // Replace with actual API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedProposals = proposals.filter((p) => p.id !== proposalId);

      setProposals(updatedProposals);
      setFilteredProposals(updatedProposals);
      calculateStatistics(updatedProposals);

      toast.success("Proposal deleted successfully");
    } catch (error) {
      console.error("Failed to delete proposal:", error);
      toast.error("Failed to delete proposal");
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
          >
            Pending
          </Badge>
        );
      case "pending_review":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            Under Review
          </Badge>
        );
      case "reviewed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          >
            Reviewed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get applicant icon based on type
  const getApplicantIcon = (applicantType) => {
    if (applicantType === "student") {
      return (
        <GraduationCap className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
      );
    } else {
      return (
        <UserSquare className="h-4 w-4 text-purple-500 dark:text-purple-400 mr-2" />
      );
    }
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
              placeholder="Search by title, applicant or department..."
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
                  colSpan={8}
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
                  <TableCell className="font-medium">
                    {proposal.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getApplicantIcon(proposal.applicantType)}
                      <span>{proposal.applicant}</span>
                    </div>
                  </TableCell>
                  <TableCell>{proposal.department}</TableCell>
                  <TableCell>{proposal.fiscalYear}</TableCell>
                  <TableCell>
                    {new Date(proposal.submissionDate).toLocaleDateString()}
                  </TableCell>
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
                                        PDF Preview Unavailable
                                      </h3>
                                      <p className="text-muted-foreground text-sm mb-4">
                                        The PDF file is not available in
                                        development mode.
                                      </p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                      >
                                        <Download className="mr-2 h-4 w-4" />{" "}
                                        Download Part A
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <iframe
                                  src={proposal.partAPdfUrl}
                                  className="w-full h-full border rounded"
                                  title={`${proposal.title} Part A`}
                                />
                              )}
                            </TabsContent>
                            <TabsContent value="partB" className="h-[60vh]">
                              {proposal.partBPdfUrl ? (
                                <>
                                  <div className="bg-slate-50 dark:bg-slate-800/50 border rounded flex items-center justify-center h-full">
                                    <div className="text-center p-6">
                                      <FileText className="h-12 w-12 text-slate-400 mb-4 mx-auto" />
                                      <h3 className="font-medium text-lg mb-2">
                                        PDF Preview Unavailable
                                      </h3>
                                      <p className="text-muted-foreground text-sm mb-4">
                                        The PDF file is not available in
                                        development mode.
                                      </p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                      >
                                        <Download className="mr-2 h-4 w-4" />{" "}
                                        Download Part B
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <iframe
                                  src={proposal.partBPdfUrl}
                                  className="w-full h-full border rounded"
                                  title={`${proposal.title} Part B`}
                                />
                              )}
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>

                      {/* Assign Reviewers */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={proposal.reviewers.length > 0}
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
                              <div className="grid gap-2">
                                <Label htmlFor="reviewer1Name">Name</Label>
                                <Input
                                  id="reviewer1Name"
                                  placeholder="Dr. John Doe"
                                  value={reviewerName1}
                                  onChange={(e) =>
                                    setReviewerName1(e.target.value)
                                  }
                                />
                              </div>
                              <div className="grid gap-2 mt-2">
                                <Label htmlFor="reviewer1Email">Email</Label>
                                <Input
                                  id="reviewer1Email"
                                  placeholder="reviewer1@example.com"
                                  value={reviewerEmail1}
                                  onChange={(e) =>
                                    setReviewerEmail1(e.target.value)
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
                              <div className="grid gap-2">
                                <Label htmlFor="reviewer2Name">Name</Label>
                                <Input
                                  id="reviewer2Name"
                                  placeholder="Dr. Jane Smith"
                                  value={reviewerName2}
                                  onChange={(e) =>
                                    setReviewerName2(e.target.value)
                                  }
                                />
                              </div>
                              <div className="grid gap-2 mt-2">
                                <Label htmlFor="reviewer2Email">Email</Label>
                                <Input
                                  id="reviewer2Email"
                                  placeholder="reviewer2@example.com"
                                  value={reviewerEmail2}
                                  onChange={(e) =>
                                    setReviewerEmail2(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                setSelectedProposal(proposal);
                                assignReviewers();
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Invitations
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Update Marks */}
                      {proposal.reviewers.length > 0 && (
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
                      )}

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
                            <Button variant="outline">Cancel</Button>
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
    </div>
  );
}
