import { useState, useEffect } from "react";
import { FileText, Trash2, Loader2, CalendarRange } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  // State for managing registration status
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [yearLoading, setYearLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState("2025-2026");
  const [selectedFiles, setSelectedFiles] = useState({});
  const [openDialogId, setOpenDialogId] = useState(null);
  const [documents, setDocuments] = useState([
    // Student documents
    {
      id: "student_partA_en",
      name: "Student Part A (English)",
      category: "student",
      uploaded: false,
      url: null,
      selectedFileName: null,
    },
    {
      id: "student_partA_bn",
      name: "Student Part A (Bengali)",
      category: "student",
      uploaded: false,
      url: null,
      selectedFileName: null,
    },
    {
      id: "student_partB_en",
      name: "Student Part B (English)",
      category: "student",
      uploaded: false,
      url: null,
      selectedFileName: null,
    },
    {
      id: "student_partB_bn",
      name: "Student Part B (Bengali)",
      category: "student",
      uploaded: false,
      url: null,
      selectedFileName: null,
    },
    // Teacher documents
    {
      id: "teacher_partA_en",
      name: "Teacher Part A (English)",
      category: "teacher",
      uploaded: false,
      url: null,
      selectedFileName: null,
    },
    {
      id: "teacher_partA_bn",
      name: "Teacher Part A (Bengali)",
      category: "teacher",
      uploaded: false,
      url: null,
      selectedFileName: null,
    },
    {
      id: "teacher_partB_en",
      name: "Teacher Part B (English)",
      category: "teacher",
      uploaded: false,
      url: null,
      selectedFileName: null,
    },
    {
      id: "teacher_partB_bn",
      name: "Teacher Part B (Bengali)",
      category: "teacher",
      uploaded: false,
      url: null,
      selectedFileName: null,
    },
  ]);

  const noFilesUploaded = documents.every((doc) => !doc.uploaded);
  const allUnuploadedFilesSelected = noFilesUploaded
    ? documents.length === Object.keys(selectedFiles).length
    : true;

  // Fetch initial data
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Fetch documents and setup state
  const fetchDocuments = async () => {
    try {
      // Use the new getProposalOverviews endpoint
      const response = await api.get("/api/admin/research-proposal/overviews");

      if (response.data && response.data.proposalDoc) {
        const {
          fiscal_year,
          registrationOpen: isOpen,
          student,
          teacher,
        } = response.data.proposalDoc;

        // Update current year
        setCurrentYear(fiscal_year || "2025-2026");

        // Update registration status based on the registrationOpen field
        setRegistrationOpen(isOpen);

        // Get base URL from environment variable
        const baseUrl = import.meta.env.VITE_API_URL;

        // Update document statuses
        setDocuments((prev) =>
          prev.map((doc) => {
            let url = null;
            let docPath = null;

            // Set URL based on document type
            if (doc.category === "student") {
              if (doc.id === "student_partA_en")
                docPath = student?.partA_url?.en;
              else if (doc.id === "student_partA_bn")
                docPath = student?.partA_url?.bn;
              else if (doc.id === "student_partB_en")
                docPath = student?.partB_url?.en;
              else if (doc.id === "student_partB_bn")
                docPath = student?.partB_url?.bn;
            } else if (doc.category === "teacher") {
              if (doc.id === "teacher_partA_en")
                docPath = teacher?.partA_url?.en;
              else if (doc.id === "teacher_partA_bn")
                docPath = teacher?.partA_url?.bn;
              else if (doc.id === "teacher_partB_en")
                docPath = teacher?.partB_url?.en;
              else if (doc.id === "teacher_partB_bn")
                docPath = teacher?.partB_url?.bn;
            }

            // Convert relative path to full URL if a path exists
            if (docPath) {
              // Remove any 'uploads/' prefix as it's already configured in Express
              const normalizedPath = docPath.startsWith("uploads/")
                ? docPath
                : `uploads/${docPath}`;

              const serverRoot = baseUrl.replace(/\/v1$/, "");
              url = `${serverRoot}/${normalizedPath}`;
            }

            return {
              ...doc,
              url,
              uploaded: !!docPath,
            };
          })
        );
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to fetch documents");
    }
  };

  // Toggle registration status
  const toggleRegistration = async (value) => {
    // Check if all documents are uploaded before allowing registration to be opened
    if (value) {
      const allDocsUploaded = documents.every((doc) => doc.uploaded);
      if (!allDocsUploaded) {
        toast.error("All document templates must be uploaded first");
        return;
      }
    }

    setYearLoading(true);
    try {
      // Since backend uses registrationOpen field, update it
      await api.post("/api/admin/research-proposal/fiscal-year/update", {
        fiscal_year: currentYear,
        registrationOpen: value,
      });

      setRegistrationOpen(value);
      toast.success(value ? "Submissions opened" : "Submissions closed");
    } catch (error) {
      console.error("Failed to toggle registration:", error);
      toast.error("Failed to update submission status");
    } finally {
      setYearLoading(false);
    }
  };

  // Update fiscal year
  const updateGuidelines = async () => {
    if (!currentYear) {
      toast.error("Please enter a valid fiscal year");
      return;
    }

    // Check if all documents are uploaded
    const allDocsUploaded = documents.every((doc) => doc.uploaded);
    if (!allDocsUploaded) {
      toast.error("All document templates must be uploaded first");
      return;
    }

    setYearLoading(true);
    try {
      await api.post("/api/admin/research-proposal/fiscal-year/update", {
        fiscal_year: currentYear,
      });

      toast.success("Fiscal year updated successfully");
    } catch (error) {
      console.error("Failed to update fiscal year:", error);
      toast.error("Failed to update fiscal year");
    } finally {
      setYearLoading(false);
    }
  };

  // Update all documents
  const handleUpdateAllDocuments = async () => {
    // Check if any files are selected
    if (Object.keys(selectedFiles).length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    setDocsLoading(true);
    const formData = new FormData();

    // Append each selected file to the form data
    Object.keys(selectedFiles).forEach((id) => {
      formData.append(id, selectedFiles[id]);
    });

    // Add fiscal year if it exists
    if (currentYear) {
      formData.append("fiscal_year", currentYear);
    }

    try {
      const response = await api.post(
        "/api/admin/research-proposal/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data && response.data.updatedDocument) {
        // Update the documents state with new information
        updateDocumentsFromResponse(response.data.updatedDocument);

        // Clear selected files
        setSelectedFiles({});
        toast.success("Documents updated successfully");
      }
    } catch (error) {
      console.error("Failed to upload documents:", error);
      toast.error("Failed to upload documents");
    } finally {
      setDocsLoading(false);
    }
  };

  const updateDocument = async (docId) => {
    if (!selectedFiles[docId]) {
      toast.error("Please select a file to update");
      return;
    }

    setDocsLoading(true);
    const formData = new FormData();

    // Add the selected file to the form data
    formData.append(docId, selectedFiles[docId]);

    // Add fiscal year to the request
    formData.append("fiscal_year", currentYear);

    try {
      const response = await api.post(
        "/api/admin/research-proposal/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data && response.data.updatedDocument) {
        // Update the documents state with new information
        updateDocumentsFromResponse(response.data.updatedDocument);

        // Clear just this one file from selectedFiles
        setSelectedFiles((prev) => {
          const updated = { ...prev };
          delete updated[docId];
          return updated;
        });

        setOpenDialogId(null);

        toast.success("Document updated successfully");
      }
    } catch (error) {
      console.error("Failed to update document:", error);
      toast.error("Failed to update document");
    } finally {
      setDocsLoading(false);
    }
  };

  // Helper to update documents state from API response
  const updateDocumentsFromResponse = (documentData) => {
    const {
      fiscal_year,
      registrationOpen: isOpen,
      student,
      teacher,
    } = documentData;

    // Get base URL from environment variable
    const baseUrl = import.meta.env.VITE_API_URL;

    // Update current year if it changed
    if (fiscal_year) setCurrentYear(fiscal_year);

    // Update registration status
    if (isOpen !== undefined) setRegistrationOpen(isOpen);

    // Update document statuses
    setDocuments((prev) =>
      prev.map((doc) => {
        let url = null;
        let docPath = null;

        // Set URL based on document type
        if (doc.category === "student") {
          if (doc.id === "student_partA_en") docPath = student?.partA_url?.en;
          else if (doc.id === "student_partA_bn")
            docPath = student?.partA_url?.bn;
          else if (doc.id === "student_partB_en")
            docPath = student?.partB_url?.en;
          else if (doc.id === "student_partB_bn")
            docPath = student?.partB_url?.bn;
        } else if (doc.category === "teacher") {
          if (doc.id === "teacher_partA_en") docPath = teacher?.partA_url?.en;
          else if (doc.id === "teacher_partA_bn")
            docPath = teacher?.partA_url?.bn;
          else if (doc.id === "teacher_partB_en")
            docPath = teacher?.partB_url?.en;
          else if (doc.id === "teacher_partB_bn")
            docPath = teacher?.partB_url?.bn;
        }

        // Convert relative path to full URL if a path exists
        if (docPath) {
          // Remove any 'uploads/' prefix as it's already configured in Express
          const normalizedPath = docPath.startsWith("uploads/")
            ? docPath
            : `uploads/${docPath}`;

          // Create full URL with server root (without /v1)
          const serverRoot = baseUrl.replace(/\/v1$/, "");
          url = `${serverRoot}/${normalizedPath}`;
        }

        return {
          ...doc,
          url,
          uploaded: !!docPath,
          selectedFileName: null, // Clear selected file name on successful upload
        };
      })
    );
  };

  // Check if all documents are uploaded
  const allDocsUploaded = documents.every((doc) => doc.uploaded);

  return (
    <div className="space-y-6">
      {/* Title Section */}
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
                disabled={yearLoading || !allDocsUploaded}
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
                  disabled={yearLoading || !allDocsUploaded}
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
          <div>
            <Button
              type="button"
              onClick={handleUpdateAllDocuments}
              disabled={
                Object.keys(selectedFiles).length === 0 ||
                docsLoading ||
                (noFilesUploaded && !allUnuploadedFilesSelected)
              }
            >
              {docsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  {noFilesUploaded
                    ? `Select All Documents (${
                        Object.keys(selectedFiles).length
                      }/${documents.length})`
                    : "Update Document Templates"}
                </>
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
                      <Dialog
                        open={openDialogId === doc.id}
                        onOpenChange={(open) =>
                          setOpenDialogId(open ? doc.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            type="button"
                            size="sm"
                            className="text-amber-600 hover:text-amber-700 border-amber-200"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Document</DialogTitle>
                            <DialogDescription>
                              Select a new file to replace the current document.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor={`update-file-${doc.id}`}>
                              New document file (PDF, DOC, or DOCX)
                            </Label>
                            <Input
                              id={`update-file-${doc.id}`}
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="mt-2"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSelectedFiles((prev) => ({
                                    ...prev,
                                    [doc.id]: e.target.files[0],
                                  }));

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
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" type="button">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              type="button"
                              onClick={() => {
                                if (selectedFiles[doc.id]) {
                                  updateDocument(doc.id);
                                } else {
                                  toast.error("Please select a file to update");
                                }
                              }}
                            >
                              Update Document
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
                              setSelectedFiles((prev) => ({
                                ...prev,
                                [doc.id]: e.target.files[0],
                              }));

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
                      <Dialog
                        open={openDialogId === doc.id}
                        onOpenChange={(open) =>
                          setOpenDialogId(open ? doc.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            type="button"
                            size="sm"
                            className="text-amber-600 hover:text-amber-700 border-amber-200"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Document</DialogTitle>
                            <DialogDescription>
                              Select a new file to replace the current document.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor={`update-file-${doc.id}`}>
                              New document file (PDF, DOC, or DOCX)
                            </Label>
                            <Input
                              id={`update-file-${doc.id}`}
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="mt-2"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSelectedFiles((prev) => ({
                                    ...prev,
                                    [doc.id]: e.target.files[0],
                                  }));

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
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" type="button">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              type="button"
                              onClick={() => {
                                if (selectedFiles[doc.id]) {
                                  updateDocument(doc.id);
                                } else {
                                  toast.error("Please select a file to update");
                                }
                              }}
                            >
                              Update Document
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
                              setSelectedFiles((prev) => ({
                                ...prev,
                                [doc.id]: e.target.files[0],
                              }));

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
