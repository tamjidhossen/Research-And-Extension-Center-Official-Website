import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  FileText,
  User,
  GraduationCap,
  CalendarClock,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import api from "@/lib/api";

// Mock data - replace with actual API fetch
const generateMockProjects = () => {
  const faculties = [
    "Science",
    "Arts",
    "Business",
    "Engineering",
    "Social Science",
  ];
  const departments = {
    Science: ["Physics", "Chemistry", "Mathematics", "Biology"],
    Arts: ["Literature", "History", "Philosophy", "Fine Arts"],
    Business: ["Accounting", "Finance", "Marketing", "Management"],
    Engineering: ["CSE", "EEE", "Civil Engineering", "Mechanical Engineering"],
    "Social Science": [
      "Economics",
      "Sociology",
      "Political Science",
      "Psychology",
    ],
  };
  const fiscalYears = ["2022-2023", "2021-2022", "2020-2021", "2019-2020"];

  return Array(35)
    .fill(0)
    .map((_, i) => {
      const faculty = faculties[Math.floor(Math.random() * faculties.length)];
      const department =
        departments[faculty][
          Math.floor(Math.random() * departments[faculty].length)
        ];
      const fiscalYear =
        fiscalYears[Math.floor(Math.random() * fiscalYears.length)];
      const isStudent = Math.random() > 0.5;

      return {
        id: `PRJ-${2000 + i}`,
        title: `Research on ${
          isStudent ? "Student" : "Faculty"
        } ${department} Project ${i + 1}`,
        applicantName: `${isStudent ? "Student" : "Dr."} Name ${i + 1}`,
        applicantType: isStudent ? "Student" : "Teacher",
        faculty,
        department,
        fiscalYear,
        submissionDate: new Date(
          2020 + Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ).toISOString(),
      };
    });
};

export default function PrevProposals() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    faculty: "all",
    department: "all",
    fiscalYear: "all",
    applicantType: "all",
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 10;

  // Extract unique filter options
  const [filterOptions, setFilterOptions] = useState({
    faculties: [],
    departments: {},
    fiscalYears: [],
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        // need to change this route to not be admin only
        const response = await api.get("/api/research-proposal/proposals");
        
        let realProjects = [];

        if (response.data) {
          if (response.data.StudentProposal) {
            // Process student proposals - only include status = 3 (funded proposals)
            realProjects = [
              ...realProjects,
              ...response.data.StudentProposal
                .filter(p => p.status === 3) // Only include funded proposals
                .map((p) => ({
                  id: p._id,
                  title: p.project_title,
                  applicantName: p.project_director.name_en,
                  applicantType: "Student",
                  faculty: p.faculty,
                  department: p.department,
                  fiscalYear: p.fiscal_year,
                  submissionDate: p.createdAt,
                  status: p.status,
                  approvalBudget: p.approval_budget, // Include approval budget for display
                })),
            ];
          }
  
          if (response.data.TeacherProposal) {
            // Process teacher proposals - only include status = 3 (funded proposals)
            realProjects = [
              ...realProjects,
              ...response.data.TeacherProposal
                .filter(p => p.status === 3) // Only include funded proposals
                .map((p) => ({
                  id: p._id,
                  title: p.project_title,
                  applicantName: p.project_director.name_en,
                  applicantType: "Teacher",
                  faculty: p.faculty,
                  department: p.department,
                  fiscalYear: p.fiscal_year,
                  submissionDate: p.createdAt,
                  status: p.status,
                  approvalBudget: p.approval_budget, // Include approval budget for display
                })),
            ];
          }
        }

        setProjects(realProjects);
        console.log("Loaded projects:", realProjects); 

        // Extract unique filter options
        const faculties = [...new Set(realProjects.map((p) => p.faculty))];

        // Create departments object grouped by faculty
        const departments = {};
        faculties.forEach((faculty) => {
          departments[faculty] = [
            ...new Set(
              realProjects
                .filter((p) => p.faculty === faculty)
                .map((p) => p.department)
            ),
          ];
        });

        const fiscalYears = [...new Set(realProjects.map((p) => p.fiscalYear))];

        setFilterOptions({ faculties, departments, fiscalYears });
        setLoading(false);

        // Extract unique filter options
        // const faculties = [...new Set(realProjects.map(p => p.faculty))];
        // ... handle other filter options from real data

        // DUMMY DATA - Comment out when using actual API
        // setTimeout(() => {
        //   const mockProjects = generateMockProjects();
        //   setProjects(mockProjects);

        //   // Extract unique filter options from mock data
        //   const faculties = [...new Set(mockProjects.map((p) => p.faculty))];
        //   const departments = {};
        //   faculties.forEach((faculty) => {
        //     departments[faculty] = [
        //       ...new Set(
        //         mockProjects
        //           .filter((p) => p.faculty === faculty)
        //           .map((p) => p.department)
        //       ),
        //     ];
        //   });
        //   const fiscalYears = [
        //     ...new Set(mockProjects.map((p) => p.fiscalYear)),
        //   ];

        //   setFilterOptions({ faculties, departments, fiscalYears });
        //   setLoading(false);
        // }, 1000);
      } catch (err) {
        console.error("API fetch error:", err);
        setError(err.response?.data?.message || "Failed to load proposals");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Update available departments when faculty filter changes
  useEffect(() => {
    if (
      filters.faculty !== "all" &&
      filterOptions.departments[filters.faculty]
    ) {
      setAvailableDepartments(filterOptions.departments[filters.faculty]);
    } else {
      const allDepartments = [];
      Object.values(filterOptions.departments).forEach((depts) => {
        allDepartments.push(...depts);
      });
      setAvailableDepartments([...new Set(allDepartments)]);
    }

    // Reset department filter if faculty changes
    if (
      filters.faculty !== "all" &&
      filters.department !== "all" &&
      !filterOptions.departments[filters.faculty]?.includes(filters.department)
    ) {
      setFilters((prev) => ({ ...prev, department: "all" }));
    }
  }, [filters.faculty, filterOptions.departments]);

  // Filter the projects based on selected filters
  const filteredProjects = projects.filter((project) => {
    return (
      (filters.search === "" ||
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.applicantName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        String(project.id).toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.faculty === "all" || project.faculty === filters.faculty) &&
      (filters.department === "all" ||
        project.department === filters.department) &&
      (filters.fiscalYear === "all" ||
        project.fiscalYear === filters.fiscalYear) &&
      (filters.applicantType === "all" ||
        project.applicantType === filters.applicantType)
    );
  });

  // Pagination logic
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      faculty: "all",
      department: "all",
      fiscalYear: "all",
      applicantType: "all",
    });
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-4" />
        <p className="text-emerald-700 dark:text-emerald-300">
          Loading projects...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          onClick={() => window.location.reload()}
          className="mx-auto block"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const noProjectsMatch = !loading && filteredProjects.length === 0;
  const showPagination = !loading && filteredProjects.length > 0;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">
          Research Proposals
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Browse through past and ongoing research projects at JKKNIU
        </p>
        <div className="mt-2 h-1 w-24 bg-emerald-500 dark:bg-emerald-400 mx-auto rounded-full"></div>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-8 border-emerald-100 dark:border-emerald-800/50 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search by title, applicant ..."
                  className="pl-10 bg-white dark:bg-emerald-950/30"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>
            <Button
              variant="outline"
              className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex gap-2"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
              <Filter className="h-4 w-4" />
              {filtersExpanded ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </CardHeader>

        <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
          <CollapsibleContent>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                    Faculty
                  </label>
                  <Select
                    value={filters.faculty}
                    onValueChange={(value) =>
                      handleFilterChange("faculty", value)
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-emerald-950/30">
                      <SelectValue placeholder="All Faculties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Faculties</SelectItem>
                      {filterOptions.faculties.map((faculty) => (
                        <SelectItem key={faculty} value={faculty}>
                          {faculty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                    Department
                  </label>
                  <Select
                    value={filters.department}
                    onValueChange={(value) =>
                      handleFilterChange("department", value)
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-emerald-950/30">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {availableDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                    Fiscal Year
                  </label>
                  <Select
                    value={filters.fiscalYear}
                    onValueChange={(value) =>
                      handleFilterChange("fiscalYear", value)
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-emerald-950/30">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {filterOptions.fiscalYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                    Applicant Type
                  </label>
                  <Select
                    value={filters.applicantType}
                    onValueChange={(value) =>
                      handleFilterChange("applicantType", value)
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-emerald-950/30">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
            <Separator className="mb-0" />
          </CollapsibleContent>
        </Collapsible>

        <CardContent className="p-0">
          {noProjectsMatch ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mb-2 mx-auto" />
              <p className="text-gray-600 dark:text-gray-300">
                No projects match your filters
              </p>
              <Button
                variant="link"
                onClick={resetFilters}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mt-2"
              >
                Reset all filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto px-8">
              <Table>
                <TableCaption>
                  Found {filteredProjects.length} research projects
                </TableCaption>
                <TableHeader>
                  <TableRow className="bg-emerald-50/50 dark:bg-emerald-900/20">
                    <TableHead className="w-[30%]">Title</TableHead>
                    <TableHead className="w-[15%]">Applicant</TableHead>
                    <TableHead className="w-[15%]">Department</TableHead>
                    <TableHead className="w-[15%]">Fiscal Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProjects.map((project) => (
                    <TableRow
                      key={project.id}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                      <TableCell>
                        <div className="font-medium text-emerald-700 dark:text-emerald-400">
                          {project.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Submitted: {formatDate(project.submissionDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {project.applicantType === "Student" ? (
                            <GraduationCap className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          ) : (
                            <User className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                          )}
                          <span className="text-sm">
                            {project.applicantName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {project.department}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {project.faculty}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{project.fiscalYear}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {showPagination && (
          <CardFooter className="flex justify-between pt-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing {indexOfFirstProject + 1} to{" "}
              {Math.min(indexOfLastProject, filteredProjects.length)} of{" "}
              {filteredProjects.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
