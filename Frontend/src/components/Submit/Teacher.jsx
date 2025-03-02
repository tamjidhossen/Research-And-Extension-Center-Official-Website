import { useState } from "react";
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
  Download,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  BookOpen,
  ClipboardList,
  Briefcase,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Form validation schema
const formSchema = z.object({
  // Project Director
  project_director_name_bn: z.string().min(1, "Name in Bengali is required"),
  project_director_name_en: z.string().min(1, "Name in English is required"),
  project_director_mobile: z
    .string()
    .min(11, "Valid mobile number is required"),
  project_director_email: z.string().email("Valid email is required"),

  // Professional Info
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  faculty: z.string().min(1, "Faculty is required"),

  // Project Details
  project_title_bn: z.string().min(1, "Project title in Bengali is required"),
  project_title_en: z.string().min(1, "Project title in English is required"),
  research_location: z.string().min(1, "Research location is required"),
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

export default function TeacherSubmission() {
  const [files, setFiles] = useState({
    partA: null,
    partB: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fiscalYear, setFiscalYear] = useState("2025-2026");

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_director_name_bn: "",
      project_director_name_en: "",
      project_director_mobile: "",
      project_director_email: "",
      designation: "",
      department: "",
      faculty: "",
      project_title_bn: "",
      project_title_en: "",
      research_location: "",
      approx_pages: "",
      approx_words: "",
      total_budget: "",
    },
  });

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
    if (!files.partA || !files.partB) {
      toast({
        title: "Missing files",
        description: "Please upload both Part A and Part B documents",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare form data for API
    const formData = {
      project_director: {
        name_bn: data.project_director_name_bn,
        name_en: data.project_director_name_en,
        mobile: data.project_director_mobile,
        email: data.project_director_email,
      },
      designation: data.designation,
      department: data.department,
      faculty: data.faculty,
      project_title: {
        title_bn: data.project_title_bn,
        title_en: data.project_title_en,
      },
      research_location: data.research_location,
      project_details: {
        approx_pages: parseInt(data.approx_pages),
        approx_words: parseInt(data.approx_words),
      },
      total_budget: parseFloat(data.total_budget),
    };

    try {
      console.log("Form data:", formData);
      console.log("Files:", files);

      // TODO: Implement actual API call
      // const response = await axios.post('/api/submit/teacher', formData);

      toast({
        title: "Submission successful",
        description: "Your research proposal has been submitted successfully",
      });

      form.reset();
      setFiles({ partA: null, partB: null });
    } catch (error) {
      toast({
        title: "Submission failed",
        description:
          error.message || "An error occurred while submitting the form",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">
            Teachers Research Proposal
          </h1>
          <div className="inline-block bg-emerald-100 dark:bg-emerald-800/40 px-3 py-1 rounded-full text-emerald-800 dark:text-emerald-300 text-sm font-medium mb-2">
            Fiscal Year: {fiscalYear}
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Submit your research proposal for review
          </p>
        </div>

        <Card className="mb-8 border-emerald-100 dark:border-emerald-800/50 shadow-sm">
          <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20">
            <CardTitle className="text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Form (আবেদন ফর্ম)
            </CardTitle>
            <CardDescription>
              Download the Research Project Proposal formats, complete both
              parts, and upload as PDFs.
              <br />
              গবেষণা-প্রকল্প প্রস্তাবনা দাখিল করার ফর্ম ডাউনলোড করুন, উভয় অংশ
              পূরণ করুন এবং PDF হিসাবে আপলোড করুন
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-md border border-emerald-200 dark:border-emerald-800/50">
              <h3 className="text-md font-medium mb-2 text-emerald-800 dark:text-emerald-400">
                Guidelines (নির্দেশিকা):
              </h3>

              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  Download and edit both documents using a word processor (MS
                  Word, Google Docs, etc.). You may add extra pages if
                  necessary.
                </li>
                <li>
                  Part A: Fill out the form, print it, collect required
                  signatures, scan, and upload as a PDF.
                </li>
                <li>
                  Part B: Provide all research details and upload it as a PDF.
                </li>
                <li>
                  If the research project is in English, the proposal must also
                  be in English.
                </li>
              </ul>

              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 border-t border-emerald-200 dark:border-emerald-800/50 pt-2">
                <ul className="mt-1 space-y-1">
                  <li>
                    উভয় নথি ডাউনলোড করুন এবং ওয়ার্ড প্রসেসর (MS Word, Google
                    Docs ইত্যাদি) ব্যবহার করে সম্পাদনা করুন। প্রয়োজনে অতিরিক্ত
                    পৃষ্ঠা যোগ করা যাবে।
                  </li>
                  <li>
                    ক অংশ: আবেদনপত্র পূরণ করুন, প্রিন্ট করুন, প্রয়োজনীয়
                    স্বাক্ষর সংগ্রহ করুন, তারপর স্ক্যান করে PDF আকারে আপলোড
                    করুন।
                  </li>
                  <li>খ অংশ: গবেষণার সকল বিবরণ লিখে PDF আকারে আপলোড করুন।</li>
                  <li>
                    গবেষণা প্রকল্পের ভাষা ইংরেজি হলে, প্রস্তাবনাটিও ইংরেজিতে
                    লিখতে হবে।
                  </li>
                </ul>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="justify-between flex flex-col">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Part A Application Forms/ 'ক' অংশের আবেদন ফর্ম:
                </h4>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                >
                  <Download className="h-4 w-4" />
                  Download Part A (English)
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
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
                >
                  <Download className="h-4 w-4" />
                  Download Part B (English)
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                >
                  <Download className="h-4 w-4" />
                  Download Part B (বাংলা)
                </Button>
              </div>

              <div className="space-y-4">
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
                      accept=".pdf"
                      onChange={(e) => handleFileChange("partA", e)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-200 dark:border-emerald-800"
                      onClick={() =>
                        document.querySelector('input[type="file"]').click()
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
                      accept=".pdf"
                      onChange={(e) => handleFileChange("partB", e)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-200 dark:border-emerald-800"
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .querySelectorAll('input[type="file"]')[1]
                          .click();
                      }}
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
            <Alert className="mb-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 mt-4">
              <AlertDescription className="text-red-700 dark:text-red-400">
                বিঃ দ্রঃ- গবেষণা প্রকল্পের ভাষা ইংরেজি হলে প্রস্তাবনা ইংরেজি
                ভাষায় উপস্থাপন করতে হবে।
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="personal" className="mb-8">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="personal">Personal Details</TabsTrigger>
                <TabsTrigger value="project">Project Details</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
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
                            <FormLabel>Applicants Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Name in English" {...field} />
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
                              <Input placeholder="e.g. Professor" {...field} />
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
                              <div className="flex">
                                <Building className="h-4 w-4 mr-2 text-gray-500 self-center" />
                                <Input
                                  placeholder="Your department"
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
                        name="faculty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Faculty</FormLabel>
                            <FormControl>
                              <Input placeholder="Your faculty" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="project">
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
                        name="project_title_bn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Title (Bangla)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="বাংলায় প্রকল্পের শিরোনাম"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
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
                                placeholder="Location where research will be conducted"
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
                              <Input placeholder="e.g. 15000" {...field} />
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
                              <Input placeholder="e.g. 150000" {...field} />
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
                          Please ensure part A is signed by the
                          Applicant, Head of the Department, and Faculty Dean before
                          submission.
                        </p>
                        <p className="mt-1">
                          জমা দেওয়ার পুর্বে আবেদন ফর্ম এর 'ক' অংশে আবেদনকারী, বিভাগীয়
                          প্রধান এবং ডীনের স্বাক্ষর আছে কিনা তা নিশ্চিত করুন।
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
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
}
