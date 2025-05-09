import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster } from "@/components/ui/toaster";
import {
  Loader2,
  Send,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export function RequestUpdateDialog({ proposal, isOpen, onClose, onSuccess }) {
  console.log("Proposals-> ", proposal);
  const [message, setMessage] = useState("");
  const [expiryDays, setExpiryDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const response = await api.post("/api/update-request/send", {
        proposal_id: proposal.id,
        proposal_type: proposal.applicantType.toLowerCase(),
        message: message,
        expiry_days: expiryDays,
      });
      console.log("response from send: ", response);

      if (response.data.success) {
        toast({
          title: "Update request sent",
          description: "The update request has been sent to the applicant.",
        });
        onSuccess && onSuccess(response.data);
        handleClose();
      }
    } catch (error) {
      toast({
        title: "Failed to send request",
        description:
          error.response?.data?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    setExpiryDays(7);
    onClose();
  };

  const handleViewEvaluation = (url) => {
    if (!url || url === "/") return;

    const baseUrl = import.meta.env.VITE_API_URL || "";
    const serverRoot = baseUrl.replace(/\/v1$/, "");
    const fileUrl = `${serverRoot}/${url}`;
    window.open(fileUrl, "_blank");
  };

  // Check if there are any reviewers with evaluation sheets
  const reviewersWithEvaluations =
    proposal?.reviewers?.filter(
      (reviewer) =>
        reviewer.evaluationSheetUrl && reviewer.evaluationSheetUrl !== "/"
    ) || [];

  const hasReviewerComments = reviewersWithEvaluations.length > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Request Proposal Updates</DialogTitle>
            <DialogDescription>
              Send a request to the applicant to update their proposal
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 p-4 -mr-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Proposal Info */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-900/50">
                <p className="text-sm font-medium">{proposal?.title}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted by {proposal?.applicant}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  {proposal?.applicant_email || "Email not available"}
                </p>
              </div>

              {/* Message Field */}
              <div className="grid gap-2">
                <Label htmlFor="message">Message to Applicant (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Please explain what changes are needed..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {/* Reviewer Comments Section */}
              {proposal?.reviewers && proposal.reviewers.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Reviewer Comments
                  </Label>

                  <div className="border rounded-md p-3 space-y-3 bg-slate-50 dark:bg-slate-900/20">
                    {hasReviewerComments ? (
                      reviewersWithEvaluations.map((reviewer, index) => (
                        <div
                          key={reviewer.id || index}
                          className="flex items-start justify-between p-2 border-b last:border-b-0"
                        >
                          <div className="flex items-start space-x-2">
                            <div>
                              <p className="text-sm font-medium">
                                Reviewer {index + 1}:{" "}
                                {reviewer.name || "Anonymous"}
                              </p>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-blue-600"
                            onClick={() =>
                              handleViewEvaluation(reviewer.evaluationSheetUrl)
                            }
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-3 text-sm text-gray-500">
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                        No reviewer comments available
                      </div>
                    )}

                    {hasReviewerComments && (
                      <div className="mt-2 pt-2 border-t text-xs text-blue-700 flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        <span>
                          Reviewer comments will be sent with proposal update
                          request
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Expiration Field */}
              <div className="grid gap-2">
                <Label htmlFor="expiryDays">Expiration Period (Days)</Label>
                <Input
                  id="expiryDays"
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                  min="1"
                  max="90"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Number of days the proposal update request will remain valid.
                </p>
              </div>
            </form>

            {/* Footer moved inside the scrollable area */}
            <div className="pt-4 mt-4 border-t">
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
