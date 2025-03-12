import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Upload,
  FileText,
  FileX,
  Loader2,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  BookOpen,
  ClipboardList,
  BriefcaseBusiness,
  CheckCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";

// Form validation schema
const formSchema = z.object({
  // Project Director
  project_director_name_en: z.string().min(1, "Name in English is required"),
  project_director_mobile: z
    .string()
    .min(11, "Valid mobile number is required"),
  project_director_email: z.string().email("Valid email is required"),

  // Academic Info
  department: z.string().min(1, "Department is required"),
  faculty: z.string().min(1, "Faculty is required"),
  session: z.string().min(1, "Session is required"),
  roll_no: z.string().min(1, "Roll number is required"),
  cgpa_honours: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) <= 4.0, {
      message: "CGPA must be a valid number up to 4.0",
    }),

  // Supervisor
  supervisor_name: z.string().min(1, "Supervisor name is required"),
  supervisor_department: z.string().min(1, "Supervisor department is required"),
  supervisor_faculty: z.string().min(1, "Supervisor faculty is required"),
  supervisor_designation: z
    .string()
    .min(1, "Supervisor designation is required"),

  // Project Details
  project_title: z.string().min(1, "Project title required"),
  approx_pages: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "Must be a valid number",
  }),
  approx_words: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "Must be a valid number",
  }),
  total_budget: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Must be a valid number",
  }),
});

export default function StudentSubmission() {
  const [files, setFiles] = useState({
    partA: null,
    partB: null,
  });

  const [fiscalYear, setFiscalYear] = useState("2025-2026");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [documentUrls, setDocumentUrls] = useState({
    partA_en: null,
    partA_bn: null,
    partB_en: null,
    partB_bn: null,
  });

  // refs for scroll targets
  const personalTabRef = useRef(null);
  const academicTabRef = useRef(null);
  const projectTabRef = useRef(null);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_director_name_en: "",
      project_director_mobile: "",
      project_director_email: "",
      department: "",
      faculty: "",
      session: "",
      roll_no: "",
      cgpa_honours: "",
      supervisor_name: "",
      supervisor_designation: "",
      supervisor_department: "",
      supervisor_faculty: "",
      project_title: "",
      approx_pages: "",
      approx_words: "",
      total_budget: "",
    },
    mode: "onSubmit",
  });

  // Faculty and departments mapping
  const facultyDepartmentMap = {
    "Faculty of Arts": [
      "Bangla Language and Literature",
      "English Language and Literature",
      "Music",
      "Theatre and Performance Studies",
      "Film and Media",
      "Philosophy",
      "History",
    ],
    "Faculty of Fine Arts": ["Fine Arts", "History"],
    "Faculty of Science and Engineering": [
      "Computer Science and Engineering",
      "Electrical and Electronic Engineering",
      "Environmental Science and Engineering",
      "Statistics",
    ],
    "Faculty of Social Science": [
      "Economics",
      "Public Administration and Governance Studies",
      "Folklore",
      "Anthropology",
      "Population Science",
      "Local Government and Urban Development",
      "Sociology",
    ],
    "Faculty of Law": ["Law and Justice"],
    "Faculty of Business Administration": [
      "Accounting and Information Systems",
      "Finance and Banking",
      "Human Resource Management",
      "Management",
      "Marketing",
    ],
  };

  const faculties = Object.keys(facultyDepartmentMap);
  const [availableDepartments, setAvailableDepartments] = useState([]);

  // Update departments when faculty changes
  const handleFacultyChange = (value) => {
    form.setValue("faculty", value);
    form.setValue("department", ""); // Reset department when faculty changes
    setAvailableDepartments(facultyDepartmentMap[value] || []);
  };

  // Fetch registration status and document URLs
  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        const response = await api.get(
          "/api/admin/research-proposal/overviews"
        );

        if (response.data && response.data.proposalDoc) {
          const { fiscal_year, registrationOpen, student } =
            response.data.proposalDoc;

          setIsRegistrationOpen(registrationOpen === true);
          setFiscalYear(fiscal_year || "2025-2026");

          // Get base URL from environment variable
          const baseUrl = import.meta.env.VITE_API_URL || "";
          const serverRoot = baseUrl.replace(/\/v1$/, "");

          // Create URLs for document downloads
          const createFullUrl = (path) => {
            if (!path) return null;
            const normalizedPath = path.startsWith("uploads")
              ? path
              : `uploads/${path}`;
            return `${serverRoot}/${normalizedPath}`;
          };

          setDocumentUrls({
            partA_en: createFullUrl(student?.partA_url?.en),
            partA_bn: createFullUrl(student?.partA_url?.bn),
            partB_en: createFullUrl(student?.partB_url?.en),
            partB_bn: createFullUrl(student?.partB_url?.bn),
          });
        }
      } catch (error) {
        // console.error("Failed to fetch registration status:", error);
        toast({
          title: "Error",
          description: "Failed to fetch registration status",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrationStatus();
  }, []);

  // Function to handle file downloads
  const handleDownload = (url, baseName) => {
    if (!url) {
      toast({
        title: "Download Failed",
        description: "Document template is not available",
        variant: "destructive",
      });
      return;
    }

    // Extract file extension from URL
    const fileExtension = url.split(".").pop().toLowerCase();
    const fileName = `${baseName}.${fileExtension}`;

    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const checkForErrorsAndNavigate = (errors) => {
    if (Object.keys(errors).length === 0) return;

    // Define which fields belong to which tabs
    const personalFields = [
      "project_director_name_en",
      "project_director_mobile",
      "project_director_email",
    ];

    const academicFields = [
      "department",
      "faculty",
      "session",
      "roll_no",
      "cgpa_honours",
      "supervisor_name",
      "supervisor_designation",
    ];

    const projectFields = [
      // "project_title_bn",
      // "project_title_en",
      "project_title",
      "approx_pages",
      "approx_words",
      "total_budget",
    ];

    // Get all error field names
    const errorFields = Object.keys(errors);

    // Check which tab has errors and navigate to it
    if (errorFields.some((field) => personalFields.includes(field))) {
      setActiveTab("personal");
      setTimeout(
        () => personalTabRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    } else if (errorFields.some((field) => academicFields.includes(field))) {
      setActiveTab("academic");
      setTimeout(
        () => academicTabRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    } else if (errorFields.some((field) => projectFields.includes(field))) {
      setActiveTab("project");
      setTimeout(
        () => projectTabRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    }
  };

  const handleFileChange = (part, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF files only",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "File size should not exceed 5MB",
          variant: "destructive",
        });
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [part]: file,
      }));

      toast({
        title: "File uploaded",
        description: `${
          part === "partA" ? "Part A" : "Part B"
        } file has been added`,
      });
    }
  };

  const onSubmit = async (data) => {
    // console.log("eihne");
    if (!files.partA || !files.partB) {
      toast({
        title: "Missing files",
        description: "Please upload both Part A and Part B documents",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Create FormData object for file upload
    const formData = new FormData();

    // Add files
    formData.append("partA", files.partA);
    formData.append("partB", files.partB);

    // Add form data as JSON
    formData.append(
      "project_director",
      JSON.stringify({
        name_en: data.project_director_name_en,
        mobile: data.project_director_mobile,
        email: data.project_director_email,
      })
    );
    formData.append("department", data.department);
    formData.append("faculty", data.faculty);
    formData.append("session", data.session);
    formData.append("roll_no", data.roll_no);
    formData.append("cgpa_honours", data.cgpa_honours);
    formData.append(
      "supervisor",
      JSON.stringify({
        name: data.supervisor_name,
        designation: data.supervisor_designation,
        department: data.supervisor_department,
        faculty: data.supervisor_faculty,
      })
    );
    formData.append(
      "project_title",
      data.project_title
      // JSON.stringify({
      //   title_bn: data.project_title_bn,
      //   title_en: data.project_title_en,
      // })
    );
    formData.append(
      "project_details",
      JSON.stringify({
        approx_pages: parseInt(data.approx_pages),
        approx_words: parseInt(data.approx_words),
      })
    );
    formData.append("total_budget", data.total_budget);

    try {
      const response = await api.post(
        "/api/research-proposal/student/submit",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // console.log("API response:", response.data);
      // DUMMY RESPONSE - Comment out when using actual API
      // console.log("Form data:", proposalData);
      // console.log("Files:", files);

      toast({
        title: "Submission successful",
        description: "Your research proposal has been submitted successfully",
      });

      form.reset();
      setFiles({ partA: null, partB: null });

      setSubmissionSuccess(true);
    } catch (error) {
      toast({
        title: "Submission failed",
        description:
          error.response?.data?.message ||
          "An error occurred while submitting the form",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewSubmission = () => {
    setSubmissionSuccess(false);
  };

  const handleFormError = (errors) => {
    // When the form has errors, this function will be called
    checkForErrorsAndNavigate(errors);
    return false; // Prevent default form submission
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">
            Student Research Proposal
          </h1>
          <div className="inline-block bg-emerald-100 dark:bg-emerald-800/40 px-3 py-1 rounded-full text-emerald-800 dark:text-emerald-300 text-sm font-medium mb-2">
            Fiscal Year: {fiscalYear}
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Submit your research proposal
          </p>
        </div>
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-600" />
            <p className="mt-4">Loading...</p>
          </div>
        ) : !isRegistrationOpen ? (
          // Registration closed view
          <Card className="border-red-100 dark:border-red-800/50 shadow-sm">
            <CardHeader className="bg-red-50/50 dark:bg-red-900/20">
              <CardTitle className="text-red-800 dark:text-red-400 flex items-center gap-2">
                <FileX className="h-5 w-5" />
                Submissions Closed
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                Research proposal submissions are currently closed.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-4 text-center">
              <div className="py-10">
                <FileX className="h-20 w-20 text-red-500/50 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Registration Closed
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  The submission period for research proposals is currently
                  closed. Please check back later or contact the Research and
                  Extension Center for more information.
                </p>
              </div>

              {/* Still show download buttons */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Download Application Forms:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() =>
                      handleDownload(
                        documentUrls.partA_en,
                        "Student_PartA_English"
                      )
                    }
                    disabled={!documentUrls.partA_en}
                  >
                    <Download className="h-4 w-4" />
                    Part A (English)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() =>
                      handleDownload(
                        documentUrls.partA_bn,
                        "Student_PartA_Bengali"
                      )
                    }
                    disabled={!documentUrls.partA_bn}
                  >
                    <Download className="h-4 w-4" />
                    Part A (বাংলা)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() =>
                      handleDownload(
                        documentUrls.partB_en,
                        "Student_PartB_English"
                      )
                    }
                    disabled={!documentUrls.partB_en}
                  >
                    <Download className="h-4 w-4" />
                    Part B (English)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() =>
                      handleDownload(
                        documentUrls.partB_bn,
                        "Student_PartB_Bengali"
                      )
                    }
                    disabled={!documentUrls.partB_bn}
                  >
                    <Download className="h-4 w-4" />
                    Part B (বাংলা)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : submissionSuccess ? (
          // Success state - add this new section
          <Card className="border-green-100 dark:border-green-800/50 shadow-sm">
            <CardHeader className="bg-green-50/50 dark:bg-green-900/20">
              <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Submission Successful!
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Your research proposal has been submitted successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6 text-center">
              <div className="py-8">
                <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
                <h3 className="text-2xl font-medium mb-4">Thank You!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  Your research proposal has been successfully submitted. You
                  will be notified about the status of your application.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleStartNewSubmission}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Submit Another Proposal
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/">Return to Homepage</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Registration open - show the full form
          <>
            {/* Download and Upload Forms Card */}
            <Card className="mb-8 border-emerald-100 dark:border-emerald-800/50 shadow-sm">
              <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20">
                <CardTitle className="text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Form (আবেদন ফর্ম)
                </CardTitle>
                <CardDescription>
                  Download the Research Project Proposal forms, complete both
                  parts, and upload as PDFs.
                  <br />
                  গবেষণা-প্রকল্প প্রস্তাবনা দাখিল করার ফর্ম ডাউনলোড করুন, উভয়
                  অংশ পূরণ করুন এবং PDF হিসাবে আপলোড করুন
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-4">
                {/* Guidelines Section */}
                <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                  <h3 className="text-md font-medium mb-2 text-emerald-800 dark:text-emerald-400">
                    Guidelines (নির্দেশিকা):
                  </h3>

                  <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                    <li>
                      Download and edit both documents using a word processor
                      (MS Word, Google Docs, etc.). You may add extra pages if
                      necessary.
                    </li>
                    <li>
                      Part A: Fill out the form, print it, collect required
                      signatures, scan, and upload as a PDF.
                    </li>
                    <li>
                      Part B: Provide all research details and upload it as a
                      PDF.
                    </li>
                    <li>
                      If the research project is in English, the proposal must
                      also be in English.
                    </li>
                  </ul>

                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 border-t border-emerald-200 dark:border-emerald-800/50 pt-2">
                    <ul className="mt-1 space-y-1">
                      <li>
                        উভয় নথি ডাউনলোড করুন এবং ওয়ার্ড প্রসেসর (MS Word,
                        Google Docs ইত্যাদি) ব্যবহার করে সম্পাদনা করুন।
                        প্রয়োজনে অতিরিক্ত পৃষ্ঠা যোগ করা যাবে।
                      </li>
                      <li>
                        ক অংশ: আবেদন ফর্ম পূরণ করুন, প্রিন্ট করুন, প্রয়োজনীয়
                        স্বাক্ষর সংগ্রহ করুন, তারপর স্ক্যান করে PDF আকারে আপলোড
                        করুন।
                      </li>
                      <li>
                        খ অংশ: গবেষণার সকল বিবরণ লিখে PDF আকারে আপলোড করুন।
                      </li>
                      <li>
                        গবেষণা প্রকল্পের ভাষা ইংরেজি হলে, প্রস্তাবনাটিও ইংরেজিতে
                        লিখতে হবে।
                      </li>
                    </ul>
                  </p>
                </div>

                {/* Download and Upload Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Download Buttons */}
                  <div className="justify-between flex flex-col">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Part A Application Forms/ 'ক' অংশের আবেদন ফর্ম:
                    </h4>
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      onClick={() =>
                        handleDownload(
                          documentUrls.partA_en,
                          "Student_PartA_English"
                        )
                      }
                      disabled={!documentUrls.partA_en}
                    >
                      <Download className="h-4 w-4" />
                      Download Part A (English)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      onClick={() =>
                        handleDownload(
                          documentUrls.partA_bn,
                          "Student_PartA_Bengali"
                        )
                      }
                      disabled={!documentUrls.partA_bn}
                    >
                      <Download className="h-4 w-4" />
                      Download Part A (বাংলা)
                    </Button>

                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mt-4 mb-2">
                      Part B Application Forms/ 'খ' অংশের আবেদন ফর্ম:
                    </h4>
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      onClick={() =>
                        handleDownload(
                          documentUrls.partB_en,
                          "Student_PartB_English"
                        )
                      }
                      disabled={!documentUrls.partB_en}
                    >
                      <Download className="h-4 w-4" />
                      Download Part B (English)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      onClick={() =>
                        handleDownload(
                          documentUrls.partB_bn,
                          "Student_PartB_Bengali"
                        )
                      }
                      disabled={!documentUrls.partB_bn}
                    >
                      <Download className="h-4 w-4" />
                      Download Part B (বাংলা)
                    </Button>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-4">
                    {/* Part A Upload */}
                    <div className="rounded-md border border-dashed border-emerald-300 dark:border-emerald-800 px-6 py-8 text-center">
                      <label className="flex flex-col items-center cursor-pointer text-sm">
                        <Upload className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                        <span className="font-medium text-emerald-800 dark:text-emerald-300 mb-1">
                          Upload Part A (PDF)
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                          Max size: 5MB
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          id="partAInput"
                          accept=".pdf"
                          onChange={(e) => handleFileChange("partA", e)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-emerald-200 dark:border-emerald-800"
                          onClick={() =>
                            document.getElementById("partAInput").click()
                          }
                        >
                          Select File
                        </Button>
                        {files.partA && (
                          <span className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                            {files.partA.name}
                          </span>
                        )}
                      </label>
                    </div>

                    {/* Part B Upload */}
                    <div className="rounded-md border border-dashed border-emerald-300 dark:border-emerald-800 px-6 py-8 text-center">
                      <label className="flex flex-col items-center cursor-pointer text-sm">
                        <Upload className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                        <span className="font-medium text-emerald-800 dark:text-emerald-300 mb-1">
                          Upload Part B (PDF)
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                          Max size: 5MB
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          id="partBInput"
                          accept=".pdf"
                          onChange={(e) => handleFileChange("partB", e)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-emerald-200 dark:border-emerald-800"
                          onClick={() =>
                            document.getElementById("partBInput").click()
                          }
                        >
                          Select File
                        </Button>
                        {files.partB && (
                          <span className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                            {files.partB.name}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Alert Notice */}
                <Alert className="mb-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 mt-4">
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    বিঃ দ্রঃ- গবেষণা প্রকল্পের ভাষা ইংরেজি হলে প্রস্তাবনা ইংরেজি
                    ভাষায় উপস্থাপন করতে হবে।
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Form Section */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, handleFormError)}
                noValidate
              >
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="mb-8"
                >
                  <TabsList className="grid grid-cols-3 w-full h-auto">
                    <TabsTrigger
                      value="personal"
                      className="px-2 py-1.5 h-auto min-h-[2.5rem] flex items-center justify-center text-xs sm:text-sm"
                    >
                      Applicant Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="academic"
                      className="px-2 py-1.5 h-auto min-h-[2.5rem] flex items-center justify-center text-xs sm:text-sm"
                    >
                      Academic Info
                    </TabsTrigger>
                    <TabsTrigger
                      value="project"
                      className="px-2 py-1.5 h-auto min-h-[2.5rem] flex items-center justify-center text-xs sm:text-sm"
                    >
                      Project Details
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Tab */}
                  <TabsContent value="personal">
                    <div ref={personalTabRef}>
                      <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                        <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20">
                          <CardTitle className="text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="project_director_name_en"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Applicant's Name (English)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Name in English"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="project_director_mobile"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Mobile Number</FormLabel>
                                  <FormControl>
                                    <div className="flex">
                                      <Phone className="h-4 w-4 mr-2 text-gray-500 self-center" />
                                      <Input
                                        placeholder="01XXXXXXXXX"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="project_director_email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <div className="flex">
                                      <Mail className="h-4 w-4 mr-2 text-gray-500 self-center" />
                                      <Input
                                        placeholder="email@example.com"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Academic Tab */}
                  <TabsContent value="academic">
                    <div ref={academicTabRef}>
                      <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                        <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20">
                          <CardTitle className="text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Academic Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="faculty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Faculty</FormLabel>
                                  <FormControl>
                                    <Select
                                      value={field.value}
                                      onValueChange={(value) =>
                                        handleFacultyChange(value)
                                      }
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select your faculty" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {faculties.map((faculty) => (
                                          <SelectItem
                                            key={faculty}
                                            value={faculty}
                                          >
                                            {faculty}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="department"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Department</FormLabel>
                                  <FormControl>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                      disabled={!form.getValues("faculty")}
                                    >
                                      <SelectTrigger className="w-full">
                                        <div className="flex">
                                          <Building className="h-4 w-4 mr-2 text-gray-500 self-center" />
                                          <SelectValue placeholder="Select your department" />
                                        </div>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableDepartments.map((dept) => (
                                          <SelectItem key={dept} value={dept}>
                                            {dept}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="session"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Session</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. 2020-21"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="roll_no"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Roll Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Your roll number"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="cgpa_honours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CGPA (Honours)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. 3.75" {...field} />
                                </FormControl>
                                <FormMessage />
                                <FormDescription>
                                  Enter your Honours CGPA
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <Separator className="my-4" />

                          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <BriefcaseBusiness className="h-5 w-5" />
                            Supervisor Information
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="supervisor_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Supervisor Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Supervisor's full name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="supervisor_department"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Supervisor Department</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. Philosophy"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="supervisor_faculty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Supervisor Faculty</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Arts" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="supervisor_designation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Supervisor Designation</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. Professor"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Project Tab */}
                  <TabsContent value="project">
                    <div ref={projectTabRef}>
                      <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                        <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20">
                          <CardTitle className="text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Project Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="project_title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Project Title (Bangla/ English)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Project name in Bangla or English"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* <FormField
                          control={form.control}
                          name="project_title_en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Title (English)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Project title in English"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        /> */}
                          </div>

                          <Separator className="my-4" />

                          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            Project Specifications
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="approx_pages"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Approximate Pages</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. 50" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="approx_words"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Approximate Words</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. 15000"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="total_budget"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total Budget (BDT)</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. 150000"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 mt-4">
                            <AlertTitle className="text-blue-800 dark:text-blue-300">
                              Important Note / গুরুত্বপূর্ণ তথ্য
                            </AlertTitle>
                            <AlertDescription className="text-blue-700 dark:text-blue-400">
                              <p>
                                Before submission, please ensure part A is
                                signed by the Applicant, Head of the Department,
                                and Faculty Dean.
                              </p>
                              <p className="mt-1">
                                জমা দেওয়ার পুর্বে আবেদন ফর্ম এর 'ক' অংশে
                                আবেদনকারী, বিভাগীয় প্রধান এবং ডীনের স্বাক্ষর
                                আছে কিনা তা নিশ্চিত করুন।
                              </p>
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                        <CardFooter>
                          <Button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={isSubmitting}
                          >
                            {isSubmitting
                              ? "Submitting..."
                              : "Submit Research Proposal"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
