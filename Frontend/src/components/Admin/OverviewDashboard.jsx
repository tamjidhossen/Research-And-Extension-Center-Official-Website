import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Trash2,
  Loader2,
  CalendarRange,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";
import api from "@/lib/api";

const OverviewDashboard = () => {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState("");
  const [yearLoading, setYearLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Student Part A - Application Form (English)",
      category: "student",
      file: null,
      uploaded: false,
      url: null,
    },
    {
      id: 2,
      name: "Student Part A - Application Form (বাংলা)",
      category: "student",
      file: null,
      uploaded: false,
      url: null,
    },
    {
      id: 3,
      name: "Student Part B - Proposal Template (English)",
      category: "student",
      file: null,
      uploaded: false,
      url: null,
    },
    {
      id: 4,
      name: "Student Part B - Proposal Template (বাংলা)",
      category: "student",
      file: null,
      uploaded: false,
      url: null,
    },
    {
      id: 5,
      name: "Teacher Part A - Application Form (English)",
      category: "teacher",
      file: null,
      uploaded: false,
      url: null,
    },
    {
      id: 6,
      name: "Teacher Part A - Application Form (বাংলা)",
      category: "teacher",
      file: null,
      uploaded: false,
      url: null,
    },
    {
      id: 7,
      name: "Teacher Part B - Proposal Template (English)",
      category: "teacher",
      file: null,
      uploaded: false,
      url: null,
    },
    {
      id: 8,
      name: "Teacher Part B - Proposal Template (বাংলা)",
      category: "teacher",
      file: null,
      uploaded: false,
      url: null,
    },
  ]);

  const docTypeMap = {
    1: "student_partA_en",
    2: "student_partA_bn",
    3: "student_partB_en",
    4: "student_partB_bn",
    5: "teacher_partA_en",
    6: "teacher_partA_bn",
    7: "teacher_partB_en",
    8: "teacher_partB_bn",
  };

  // Update guidelines
  const updateGuidelines = async () => {
    setYearLoading(true);

    try {
      if (!currentYear || currentYear.trim() === "") {
        toast.error("Please enter a valid academic year");
        setYearLoading(false);
        return;
      }

      // Use the correct endpoint with JSON format
      await api.post("/api/admin/research-proposal/fiscal-year/update", {
        fiscal_year: currentYear,
      });

      toast.success("Academic year updated successfully");
    } catch (error) {
      console.error("Failed to update year:", error);
      toast.error("Error updating academic year");
    } finally {
      setYearLoading(false);
    }
  };

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Get document information which contains fiscal year
        const response = await api.get("/api/admin/research-proposal");

        if (response.data && response.data.proposalDocument) {
          const docData = response.data.proposalDocument;

          setCurrentYear(docData.fiscal_year || "");

          setRegistrationOpen(docData.registration_open === true);

          // Map backend document structure to frontend structure
          const mappedDocs = [
            {
              id: 1,
              name: "Student Part A - Application Form (English)",
              category: "student",
              uploaded: !!docData.student?.partA_url?.en,
              url: docData.student?.partA_url?.en || null,
            },
            {
              id: 2,
              name: "Student Part A - Application Form (বাংলা)",
              category: "student",
              uploaded: !!docData.student?.partA_url?.bn,
              url: docData.student?.partA_url?.bn || null,
            },
            {
              id: 3,
              name: "Student Part B - Proposal Template (English)",
              category: "student",
              uploaded: !!docData.student?.partB_url?.en,
              url: docData.student?.partB_url?.en || null,
            },
            {
              id: 4,
              name: "Student Part B - Proposal Template (বাংলা)",
              category: "student",
              uploaded: !!docData.student?.partB_url?.bn,
              url: docData.student?.partB_url?.bn || null,
            },
            {
              id: 5,
              name: "Teacher Part A - Application Form (English)",
              category: "teacher",
              uploaded: !!docData.teacher?.partA_url?.en,
              url: docData.teacher?.partA_url?.en || null,
            },
            {
              id: 6,
              name: "Teacher Part A - Application Form (বাংলা)",
              category: "teacher",
              uploaded: !!docData.teacher?.partA_url?.bn,
              url: docData.teacher?.partA_url?.bn || null,
            },
            {
              id: 7,
              name: "Teacher Part B - Proposal Template (English)",
              category: "teacher",
              uploaded: !!docData.teacher?.partB_url?.en,
              url: docData.teacher?.partB_url?.en || null,
            },
            {
              id: 8,
              name: "Teacher Part B - Proposal Template (বাংলা)",
              category: "teacher",
              uploaded: !!docData.teacher?.partB_url?.bn,
              url: docData.teacher?.partB_url?.bn || null,
            },
          ];

          setDocuments(mappedDocs);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error("Error fetching settings");
      }
    };

    fetchSettings();
  }, []);

  // Toggle registration status
  const toggleRegistration = async () => {
    setYearLoading(true);
    try {
      if (!registrationOpen && (!currentYear || currentYear.trim() === "")) {
        toast.error("Please set a fiscal year before opening registration");
        setYearLoading(false);
        return;
      }

      await api.post("/api/admin/research-proposal/registration-status", {
        registration_open: !registrationOpen,
      });

      setRegistrationOpen(!registrationOpen);
      toast.success(
        `Registration ${!registrationOpen ? "opened" : "closed"} successfully`
      );
    } catch (error) {
      console.error("Failed to update registration status:", error);
      toast.error("Error updating registration status");
    } finally {
      setYearLoading(false);
    }
  };

  const handleUpdateAllDocuments = async () => {
    if (Object.keys(selectedFiles).length === 0) return;

    setDocsLoading(true);

    try {
      const formData = new FormData();
      // Add all selected files to formData
      Object.entries(selectedFiles).forEach(([docId, file]) => {
        const fieldName = docTypeMap[docId];
        if (fieldName) {
          formData.append(fieldName, file);
        }
      });

      // Upload all files at once
      const response = await api.post(
        "/api/admin/research-proposal/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update documents state with new URLs
      const updatedDocs = documents.map((doc) => {
        if (selectedFiles[doc.id]) {
          return {
            ...doc,
            uploaded: true,
            url: response.data.urls?.[docTypeMap[doc.id]] || null,
            selectedFileName: null,
          };
        }
        return doc;
      });

      setDocuments(updatedDocs);
      setSelectedFiles({});
      toast.success("Documents updated successfully");
    } catch (error) {
      console.error("Failed to update documents:", error);
      toast.error(error.response?.data?.message || "Error updating documents");
    } finally {
      setDocsLoading(false);
    }
  };

  // Delete document
  const deleteDocument = async (id) => {
    try {
      setDocsLoading(true);

      await api.delete(
        `/api/admin/research-proposal/document/${docTypeMap[id]}`
      );

      const updatedDocuments = documents.map((doc) => {
        if (doc.id === id) {
          return { ...doc, file: null, uploaded: false, url: null };
        }
        return doc;
      });

      setDocuments(updatedDocuments);
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Error deleting document");
    } finally {
      setDocsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Proposal Management</h2>
        <p className="text-muted-foreground">
          Manage proposal submission and upload documents for research proposals
        </p>
      </div>

      {/* Registration Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Proposal submission Status</CardTitle>
              <CardDescription>
                Enable or disable research proposal submissions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={registrationOpen}
                onCheckedChange={toggleRegistration}
                disabled={yearLoading}
              />
              <span
                className={
                  registrationOpen ? "text-emerald-600" : "text-red-500"
                }
              >
                {registrationOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-md p-3">
              <CalendarRange className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium">Current Academic Year</h3>
              <div className="flex items-center gap-2">
                <Input
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="w-40 mt-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={updateGuidelines}
                  disabled={yearLoading}
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Management */}
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Document Templates</CardTitle>
            <CardDescription>
              Upload and manage proposal submission document templates
            </CardDescription>
          </div>
          <div className="">
            <Button
              type="button"
              onClick={handleUpdateAllDocuments}
              disabled={Object.keys(selectedFiles).length === 0 || docsLoading}
            >
              {docsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>Update Document Templates</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-medium mb-4">Student Documents</h3>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {documents
              .filter((doc) => doc.category === "student")
              .map((doc) => (
                <div
                  key={doc.id}
                  className="border rounded-md p-4 bg-white dark:bg-emerald-950/30"
                >
                  {/* Document item content - same as your existing code */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                    {doc.uploaded && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      >
                        Uploaded
                      </Badge>
                    )}
                  </div>

                  {doc.uploaded ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        type="button"
                        size="sm"
                        asChild
                        className="text-blue-600 hover:text-blue-700 border-blue-200"
                      >
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          View Document
                        </a>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            type="button"
                            size="sm"
                            className="text-red-600 hover:text-red-700 border-red-200"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Document</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this document?
                              This will make it unavailable to applicants.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" type="button">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              type="button"
                              onClick={() => deleteDocument(doc.id)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="flex gap-2 items-center">
                        <Input
                          id={`file-${doc.id}`}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="text-sm"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              // Store file in state instead of uploading immediately
                              setSelectedFiles((prev) => ({
                                ...prev,
                                [doc.id]: e.target.files[0],
                              }));

                              // Update UI to show selected file
                              setDocuments((docs) =>
                                docs.map((d) =>
                                  d.id === doc.id
                                    ? {
                                        ...d,
                                        selectedFileName:
                                          e.target.files[0].name,
                                      }
                                    : d
                                )
                              );
                            }
                          }}
                        />
                      </div>
                      {doc.selectedFileName && (
                        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                          Selected: {doc.selectedFileName}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>

          <Separator className="my-6" />

          <h3 className="text-lg font-medium mb-4">Teacher Documents</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {documents
              .filter((doc) => doc.category === "teacher")
              .map((doc) => (
                <div
                  key={doc.id}
                  className="border rounded-md p-4 bg-white dark:bg-emerald-950/30"
                >
                  {/* Same document item content as above */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                    {doc.uploaded && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      >
                        Uploaded
                      </Badge>
                    )}
                  </div>

                  {doc.uploaded ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        type="button"
                        size="sm"
                        asChild
                        className="text-blue-600 hover:text-blue-700 border-blue-200"
                      >
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          View Document
                        </a>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            type="button"
                            size="sm"
                            className="text-red-600 hover:text-red-700 border-red-200"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Document</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this document?
                              This will make it unavailable to applicants.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" type="button">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              type="button"
                              onClick={() => deleteDocument(doc.id)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Label
                        htmlFor={`file-${doc.id}`}
                        className="block mb-2 text-sm"
                      >
                        Upload document (PDF or DOCX)
                      </Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id={`file-${doc.id}`}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="text-sm"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              // Store file in state instead of uploading immediately
                              setSelectedFiles((prev) => ({
                                ...prev,
                                [doc.id]: e.target.files[0],
                              }));

                              // Update UI to show selected file
                              setDocuments((docs) =>
                                docs.map((d) =>
                                  d.id === doc.id
                                    ? {
                                        ...d,
                                        selectedFileName:
                                          e.target.files[0].name,
                                      }
                                    : d
                                )
                              );
                            }
                          }}
                        />
                      </div>
                      {doc.selectedFileName && (
                        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                          Selected: {doc.selectedFileName}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default OverviewDashboard;
