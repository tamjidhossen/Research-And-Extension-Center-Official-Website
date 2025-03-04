// src/components/Admin/NoticesDashboard.jsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays,
  Trash2,
  ExternalLink,
  PlusCircle,
  FileUp,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/toaster";
import api from "@/lib/api";

export default function NoticesDashboard() {
  const [notices, setNotices] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { toast } = useToast();

  // Get the server root for file URLs
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const serverRoot = baseUrl.replace(/\/v1$/, "");

  // Fetch Notices
  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/notice/get-notice");

      const sortedNotices = response.data.sort(
        (a, b) =>
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      );
      setNotices(sortedNotices);
    } catch (error) {
      console.error("Failed to fetch notices:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch notices",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files) {
      // Convert FileList to Array and limit to remaining slots (max 5 files)
      const filesArray = Array.from(e.target.files);
      const maxFiles = 5 - selectedFiles.length;
      const newFiles = filesArray.slice(0, maxFiles);

      // Check file types and sizes
      const validFiles = newFiles.filter((file) => {
        const validTypes = [
          "image/jpeg",
          "image/png",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description:
              "Only JPEG, PNG, PDF, DOC, and DOCX files are allowed.",
          });
          return false;
        }

        if (file.size > maxSize) {
          toast({
            variant: "destructive",
            title: "File too large",
            description: "Files must be less than 5MB",
          });
          return false;
        }

        return true;
      });

      setSelectedFiles([...selectedFiles, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      link: "",
    });
    setSelectedFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title and description are required",
      });
      return;
    }

    // Create FormData object for file upload
    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    formDataObj.append("description", formData.description);
    formDataObj.append("link", formData.link || "");

    // Add files if they exist
    selectedFiles.forEach((file) => {
      formDataObj.append("files", file);
    });

    try {
      const response = await api.post("/api/notice/add", formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // Create a new notice object with the response data
        const newNotice = response.data.notice;

        // Update state with the new notice
        setNotices([newNotice, ...notices]);
        setIsDialogOpen(false);
        resetForm();

        toast({
          title: "Success",
          description: "Notice added successfully",
        });
      }
    } catch (error) {
      console.error("Failed to add notice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add notice",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/notice/delete/${id}`);

      // Remove the deleted notice from state
      setNotices(notices.filter((notice) => notice._id !== id));

      toast({
        title: "Success",
        description: "Notice deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete notice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete notice",
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading Notices...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">
            Notices Management
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Notice
            </Button>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Notice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="text-sm font-medium block mb-1"
                  >
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="text-sm font-medium block mb-1"
                  >
                    Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={5}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="link"
                    className="text-sm font-medium block mb-1"
                  >
                    External Link (optional)
                  </label>
                  <Input
                    id="link"
                    placeholder="Link (optional)"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Attachments (optional, max 5 files)
                  </label>
                  <div className="flex items-center">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      disabled={selectedFiles.length >= 5}
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      className="flex-1"
                    />
                  </div>

                  {/* Display selected files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md"
                        >
                          <span className="text-sm truncate max-w-[80%]">
                            {file.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 p-0 flex items-center justify-center"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedFiles.length >= 5 && (
                    <p className="text-xs text-amber-500 mt-1">
                      Maximum 5 files allowed
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Submit Notice</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notices.map((notice) => (
            <Card key={notice._id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold">
                    {notice.title}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px] p-4 sm:p-6">
                        <AlertDialogHeader className="space-y-2 text-center">
                          <AlertDialogTitle className="text-xl">
                            Are you sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4">
                          <AlertDialogCancel className="w-full sm:w-auto">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(notice._id)}
                            className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {formatDate(notice.date || notice.createdAt)}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {notice.description}
                </p>

                {/* Show link if exists */}
                {notice.link && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="mr-2 mb-2"
                  >
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      External Link
                    </a>
                  </Button>
                )}

                {/* Show file attachments if they exist */}
                {notice.files && notice.files.length > 0 && (
                  <div className="mt-2">
                    {notice.files.map((file, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        asChild
                        className="mr-2 mb-2"
                      >
                        <a
                          href={`${serverRoot}/${file.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          <FileUp className="h-4 w-4 mr-1" />
                          Attachment {index + 1}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {notices.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">No Notices found</p>
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster />
    </>
  );
}
