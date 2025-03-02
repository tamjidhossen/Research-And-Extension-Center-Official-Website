import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Trash2,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const OverviewDashboard = () => {
  const [registrationOpen, setRegistrationOpen] = useState(false);
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
  const [currentYear, setCurrentYear] = useState("2024-2025");
  const [loading, setLoading] = useState(false);

  // Update guidelines
  const updateGuidelines = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Guidelines updated successfully");
      setLoading(false);
    } catch (error) {
      toast.error("Failed to update guidelines");
      setLoading(false);
    }
  };

  // Toggle registration status
  const toggleRegistration = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRegistrationOpen(!registrationOpen);
      toast.success(
        `Registration ${registrationOpen ? "closed" : "opened"} successfully`
      );
      setLoading(false);
    } catch (error) {
      toast.error("Failed to update registration status");
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (id, file) => {
    try {
      setLoading(true);
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const updatedDocuments = documents.map((doc) => {
        if (doc.id === id) {
          return {
            ...doc,
            file: file,
            uploaded: true,
            url: URL.createObjectURL(file),
          };
        }
        return doc;
      });

      setDocuments(updatedDocuments);
      toast.success("Document uploaded successfully");
      setLoading(false);
    } catch (error) {
      toast.error("Failed to upload document");
      setLoading(false);
    }
  };

  // Delete document
  const deleteDocument = async (id) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedDocuments = documents.map((doc) => {
        if (doc.id === id) {
          return { ...doc, file: null, uploaded: false, url: null };
        }
        return doc;
      });

      setDocuments(updatedDocuments);
      toast.success("Document deleted successfully");
      setLoading(false);
    } catch (error) {
      toast.error("Failed to delete document");
      setLoading(false);
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
                disabled={loading}
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
                <Button size="sm" onClick={updateGuidelines} disabled={loading}>
                  Update
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Management */}
      <Card>
        <CardHeader>
          <CardTitle>Document Templates</CardTitle>
          <CardDescription>
            Upload and manage proposal submission document templates
          </CardDescription>
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
                            <Button variant="outline">Cancel</Button>
                            <Button
                              variant="destructive"
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
                              handleFileUpload(doc.id, e.target.files[0]);
                            }
                          }}
                        />
                      </div>
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
                            <Button variant="outline">Cancel</Button>
                            <Button
                              variant="destructive"
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
                              handleFileUpload(doc.id, e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewDashboard;
