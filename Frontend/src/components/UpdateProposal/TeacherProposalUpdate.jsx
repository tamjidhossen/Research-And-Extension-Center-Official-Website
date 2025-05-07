import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "react-router-dom";
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
  Users,
  Mail,
  Phone,
  Building,
  MapPin,
  BookOpen,
  ClipboardList,
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

// Form validation schema
const formSchema = z.object({
  // Project Director
  project_director_name_en: z.string().min(1, "Name is required"),
  project_director_mobile: z
    .string()
    .min(11, "Valid mobile number is required"),
  project_director_email: z.string().email("Valid email is required"),

  // Professional Info
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  faculty: z.string().min(1, "Faculty is required"),

  // Project Details
  project_title: z.string().min(1, "Project title required"),
  research_location: z.string().min(1, "Research location is required"),
  associate_investigator: z.string().optional(),
  approx_pages: z.string().refine((val) => /^\d+$/.test(val), {
    message: "Must be a whole number without decimals or special characters",
  }),
  approx_words: z.string().refine((val) => /^\d+$/.test(val), {
    message: "Must be a whole number without decimals or special characters",
  }),
  total_budget: z.string().refine((val) => /^\d+$/.test(val), {
    message: "Must be a whole number without decimals or special characters",
  }),
  // New field for update response
  update_notes: z.string().optional(),
});

export default function TeacherProposalUpdate() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [files, setFiles] = useState({
    partA: null,
    partB: null,
  });

  const [fiscalYear, setFiscalYear] = useState("2025-2026");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [proposalData, setProposalData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    expired: false,
  });
  const [updateToken, setUpdateToken] = useState("");

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_director_name_en: "",
      project_director_mobile: "",
      project_director_email: "",
      designation: "",
      department: "",
      faculty: "",
      project_title: "",
      research_location: "",
      associate_investigator: "",
      approx_pages: "",
      approx_words: "",
      total_budget: "",
      update_notes: "",
    },
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

  // Verify token and load proposal data
  useEffect(() => {
    const verifyTokenAndLoadData = async () => {
      if (!token) {
        toast({
          title: "Invalid request",
          description: "No update token provided",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        // Verify token
        const response = await api.get(`/api/update-request/verify/${token}`);

        if (response.data.success) {
          setTokenVerified(true);
          const proposal = response.data.proposal;
          setProposalData(proposal);
          setFiscalYear(proposal.fiscal_year || "0000-0000");
          setUpdateToken(response.data.update_token);
          const requestObj = {
            _id: response.data.request_id,
            valid_until: response.data.expire_time,
          };
          setRequestData(requestObj);

          // Calculate time remaining
          const validUntil = new Date(response.data.expire_time);
          const now = new Date();
          const timeLeft = validUntil - now;

          if (timeLeft <= 0) {
            setTimeRemaining({ days: 0, hours: 0, minutes: 0, expired: true });
          } else {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
              (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
            );

            setTimeRemaining({ days, hours, minutes, expired: false });
          }
          // Load proposal data
          if (response.data.proposal.proposal_type === "teacher") {
            // Populate form with existing data
            form.reset({
              project_director_name_en: proposal.project_director.name_en || "",
              project_director_mobile: proposal.project_director.mobile || "",
              project_director_email: proposal.project_director.email || "",
              designation: proposal.designation || "",
              department: proposal.department || "",
              faculty: proposal.faculty || "",
              project_title: proposal.project_title || "",
              research_location: proposal.research_location || "",
              associate_investigator: proposal.associate_investigator || "",
              approx_pages:
                proposal.project_details.approx_pages?.toString() || "",
              approx_words:
                proposal.project_details.approx_words?.toString() || "",
              total_budget: proposal.total_budget?.toString() || "",
              update_notes: "",
            });

            // Update available departments based on faculty
            if (proposal.faculty && facultyDepartmentMap[proposal.faculty]) {
              setAvailableDepartments(facultyDepartmentMap[proposal.faculty]);
            }
          } else {
            toast({
              title: "Invalid proposal type",
              description: "This update link is not for a teacher proposal",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Token verification failed",
            description: response.data.message || "Invalid or expired token",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error loading proposal data",
          description:
            error.response?.data?.message || "Failed to load proposal data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyTokenAndLoadData();
  }, [token, form]);

  // Update time remaining countdown
  useEffect(() => {
    if (!tokenVerified || timeRemaining.expired) return;

    const timer = setInterval(() => {
      const validUntil = new Date(requestData.valid_until);
      const now = new Date();
      const timeLeft = validUntil - now;

      if (timeLeft <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, expired: true });
        clearInterval(timer);
      } else {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        setTimeRemaining({ days, hours, minutes, expired: false });
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [tokenVerified, requestData, timeRemaining.expired]);

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
    if (timeRemaining.expired) {
      toast({
        title: "Update period expired",
        description: "The update period for this proposal has expired",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for file upload
      const formData = new FormData();

      formData.append("update_token", updateToken);

      // Add files only if they exist
      if (files.partA) {
        formData.append("partA", files.partA);
      }

      if (files.partB) {
        formData.append("partB", files.partB);
      }

      // Add required IDs for the backend to identify the proposal and request
      formData.append("proposal_id", proposalData._id);
      formData.append("request_id", requestData._id);

      // Create the updates object with only the fields that have been changed
      const updatesObj = {};

      // Only add values that are not empty
      if (
        data.project_director_name_en ||
        data.project_director_mobile ||
        data.project_director_email
      ) {
        updatesObj.project_director = {
          ...(data.project_director_name_en && {
            name_en: data.project_director_name_en,
          }),
          ...(data.project_director_mobile && {
            mobile: data.project_director_mobile,
          }),
          ...(data.project_director_email && {
            email: data.project_director_email,
          }),
        };
      }

      // Only add fields that have values
      if (data.designation) updatesObj.designation = data.designation;
      if (data.department) updatesObj.department = data.department;
      if (data.faculty) updatesObj.faculty = data.faculty;
      if (data.project_title) updatesObj.project_title = data.project_title;
      if (data.research_location)
        updatesObj.research_location = data.research_location;
      if (data.associate_investigator)
        updatesObj.associate_investigator = data.associate_investigator;

      // Project details
      if (data.approx_pages || data.approx_words) {
        updatesObj.project_details = {
          ...(data.approx_pages && {
            approx_pages: parseInt(data.approx_pages),
          }),
          ...(data.approx_words && {
            approx_words: parseInt(data.approx_words),
          }),
        };
      }

      if (data.total_budget)
        updatesObj.total_budget = parseInt(data.total_budget);

      // Always add update notes even if empty
      updatesObj.update_notes = data.update_notes || "";

      // Append the updates as stringified JSON
      formData.append("updates", JSON.stringify(updatesObj));

      // Use the proper endpoint for teacher proposals
      const response = await api.post(
        "/api/research-proposal/teacher/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Update successful",
          description: "Your research proposal has been updated successfully",
        });

        form.reset();
        setFiles({ partA: null, partB: null });
        setSubmissionSuccess(true);
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "An error occurred while updating the proposal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormError = (errors) => {
    console.error("Form errors:", errors);
    return false; // Prevent default form submission
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">
            Update Teacher Research Proposal
          </h1>
          <div className="inline-block bg-emerald-100 dark:bg-emerald-800/40 px-3 py-1 rounded-full text-emerald-800 dark:text-emerald-300 text-sm font-medium mb-2">
            Fiscal Year: {fiscalYear}
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Update your submitted research proposal
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-600" />
            <p className="mt-4">Loading your proposal...</p>
          </div>
        ) : !tokenVerified ? (
          <Card className="border-red-100 dark:border-red-800/50 shadow-sm">
            <CardHeader className="bg-red-50/50 dark:bg-red-900/20">
              <CardTitle className="text-red-800 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Invalid Update Request
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-6 text-center">
              <AlertTriangle className="h-24 w-24 text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-medium mb-4">Access Denied</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                The update link you are using is invalid or has expired. Please
                contact the administration for assistance.
              </p>
              <Button variant="outline" asChild>
                <a href="/">Return to Homepage</a>
              </Button>
            </CardContent>
          </Card>
        ) : timeRemaining.expired ? (
          <Card className="border-red-100 dark:border-red-800/50 shadow-sm">
            <CardHeader className="bg-red-50/50 dark:bg-red-900/20">
              <CardTitle className="text-red-800 dark:text-red-400 flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Update Period Expired
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-6 text-center">
              <Clock className="h-24 w-24 text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-medium mb-4">Time's Up</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                The update period for this proposal has expired. Please contact
                the administration if you still need to make changes.
              </p>
              <Button variant="outline" asChild>
                <a href="/">Return to Homepage</a>
              </Button>
            </CardContent>
          </Card>
        ) : submissionSuccess ? (
          <Card className="border-green-100 dark:border-green-800/50 shadow-sm">
            <CardHeader className="bg-green-50/50 dark:bg-green-900/20">
              <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Update Successful!
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Your research proposal has been updated successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6 text-center">
              <div className="py-8">
                <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
                <h3 className="text-2xl font-medium mb-4">Thank You!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  Your research proposal has been successfully updated. The
                  administration will review your changes.
                </p>
                <Button variant="outline" asChild>
                  <a href="/">Return to Homepage</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Admin Message and Time Remaining */}
            <Card className="border-amber-100 dark:border-amber-800/50 shadow-sm mb-6">
              <CardHeader className="bg-amber-50/50 dark:bg-amber-900/20">
                <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Request for Update
                </CardTitle>
                <CardDescription className="text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Remaining: {timeRemaining.days} days,{" "}
                  {timeRemaining.hours} hours, {timeRemaining.minutes} minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 mt-4">
                  <AlertDescription className="text-blue-700 dark:text-blue-400">
                    <p className="text-sm mb-2">
                      You may update any field as needed. Only upload new PDF
                      files if you want to replace existing ones.
                    </p>
                    <p className="text-sm">
                      আপনি প্রয়োজন অনুসারে যেকোনো তথ্য পরিবর্তন করতে পারেন।
                      কেবলমাত্র বিদ্যমান PDF ফাইল প্রতিস্থাপন করতে চাইলেই নতুন
                      ফাইল আপলোড করুন।
                    </p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Document Upload Card */}
            <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm mb-6">
              <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20">
                <CardTitle className="text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Updated Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
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
                      {!files.partA && (
                        <Badge
                          variant="outline"
                          className="mt-2 bg-red-50 text-red-700 border-red-200"
                        >
                          Optional
                        </Badge>
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
                      {!files.partB && (
                        <Badge
                          variant="outline"
                          className="mt-2 bg-red-50 text-red-700 border-red-200"
                        >
                          Optional
                        </Badge>
                      )}
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Section */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, handleFormError)}
                noValidate
              >
                <div className="space-y-6">
                  {/* Personal Information Card */}
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
                              <FormLabel>Applicant's Name</FormLabel>
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
                                  <Input placeholder="01XXXXXXXXX" {...field} />
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

                      <Separator className="my-4" />

                      <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Professional Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="designation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Designation</FormLabel>
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
                                      <SelectItem key={faculty} value={faculty}>
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
                    </CardContent>
                  </Card>

                  {/* Project Details Card */}
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
                                  placeholder="Project title in Bangla or English"
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
                        name="research_location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Research Location</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <MapPin className="h-4 w-4 mr-2 text-gray-500 self-center" />
                                <Input
                                  placeholder="Place of conducting research project"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator className="my-4" />
                      <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Associate Director (If any)
                      </h3>

                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="associate_investigator"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Details of Associate Director
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  className="min-h-[80px]"
                                  placeholder="Enter details of associate director"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500">
                                Include name, designation, department, faculty
                                and contact information if applicable.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="e.g. 50"
                                  {...field}
                                  onKeyDown={(e) => {
                                    // Allow: backspace, delete, tab, escape, enter, arrows
                                    const allowedKeys = [
                                      "Backspace",
                                      "Delete",
                                      "Tab",
                                      "Escape",
                                      "Enter",
                                      "ArrowLeft",
                                      "ArrowRight",
                                      "ArrowUp",
                                      "ArrowDown",
                                      "Home",
                                      "End",
                                    ];

                                    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                    if (
                                      (e.ctrlKey === true ||
                                        e.metaKey === true) &&
                                      ["a", "c", "v", "x"].indexOf(
                                        e.key.toLowerCase()
                                      ) !== -1
                                    ) {
                                      return;
                                    }

                                    // Allow numbers 0-9
                                    if (
                                      /^\d$/.test(e.key) ||
                                      allowedKeys.includes(e.key)
                                    ) {
                                      return;
                                    }

                                    // Prevent the default action for all other keys
                                    e.preventDefault();
                                  }}
                                  onChange={(e) => {
                                    // Still clean any non-digits as a safety measure
                                    const value = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                              <FormDescription>
                                Enter the maximum estimated number of pages
                              </FormDescription>
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
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="e.g. 15000"
                                  {...field}
                                  onKeyDown={(e) => {
                                    // Allow: backspace, delete, tab, escape, enter, arrows
                                    const allowedKeys = [
                                      "Backspace",
                                      "Delete",
                                      "Tab",
                                      "Escape",
                                      "Enter",
                                      "ArrowLeft",
                                      "ArrowRight",
                                      "ArrowUp",
                                      "ArrowDown",
                                      "Home",
                                      "End",
                                    ];

                                    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                    if (
                                      (e.ctrlKey === true ||
                                        e.metaKey === true) &&
                                      ["a", "c", "v", "x"].indexOf(
                                        e.key.toLowerCase()
                                      ) !== -1
                                    ) {
                                      return;
                                    }

                                    // Allow numbers 0-9
                                    if (
                                      /^\d$/.test(e.key) ||
                                      allowedKeys.includes(e.key)
                                    ) {
                                      return;
                                    }

                                    // Prevent the default action for all other keys
                                    e.preventDefault();
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                              <FormDescription>
                                Enter the maximum estimated word count
                              </FormDescription>
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
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="e.g. 150000"
                                  {...field}
                                  onKeyDown={(e) => {
                                    // Allow: backspace, delete, tab, escape, enter, arrows
                                    const allowedKeys = [
                                      "Backspace",
                                      "Delete",
                                      "Tab",
                                      "Escape",
                                      "Enter",
                                      "ArrowLeft",
                                      "ArrowRight",
                                      "ArrowUp",
                                      "ArrowDown",
                                      "Home",
                                      "End",
                                    ];

                                    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                    if (
                                      (e.ctrlKey === true ||
                                        e.metaKey === true) &&
                                      ["a", "c", "v", "x"].indexOf(
                                        e.key.toLowerCase()
                                      ) !== -1
                                    ) {
                                      return;
                                    }

                                    // Allow numbers 0-9
                                    if (
                                      /^\d$/.test(e.key) ||
                                      allowedKeys.includes(e.key)
                                    ) {
                                      return;
                                    }

                                    // Prevent the default action for all other keys
                                    e.preventDefault();
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                              <FormDescription>
                                <p>Enter whole number</p>
                                <p>No special characters allowed</p>
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Update Notes (optional)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="update_notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Description of the changes you have made to the proposal"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? "Submitting..."
                          : "Submit Updated Proposal"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
