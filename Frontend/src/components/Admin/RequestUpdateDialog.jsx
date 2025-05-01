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
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export function RequestUpdateDialog({ proposal, isOpen, onClose, onSuccess }) {
    console.log(proposal)
  const [message, setMessage] = useState("");
  const [expiryDays, setExpiryDays] = useState(7);
  const [includeEvaluations, setIncludeEvaluations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const hasEvaluationSheets = proposal?.reviewers?.some(
    (r) => r.evaluationSheetUrl && r.evaluationSheetUrl !== "/"
  );

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
    setIncludeEvaluations(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Request Proposal Updates</DialogTitle>
          <DialogDescription>
            Send a request to the applicant to update their proposal. Specify
            what changes are needed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Proposal Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-900/50">
            <p className="text-sm font-medium">{proposal?.title}</p>
            <p className="text-xs text-muted-foreground">
              Submitted by {proposal?.applicant}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {proposal?.applicant_email|| "Email not available"}
            </p>
          </div>

          {/* Message Field */}
          <div className="grid gap-2">
            <Label htmlFor="message">Message to Applicant</Label>
            <Textarea
              id="message"
              placeholder="Please explain what changes are needed..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Clearly describe the changes the applicant needs to make to their
              proposal.
            </p>
          </div>

          {/* Include Evaluation Sheets */}
          {hasEvaluationSheets && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeEvaluations"
                checked={includeEvaluations}
                onCheckedChange={setIncludeEvaluations}
              />
              <Label htmlFor="includeEvaluations" className="text-sm">
                Include reviewer evaluation sheets
              </Label>
            </div>
          )}

          {/* Expiration Field */}
          <div className="grid gap-2">
            <Label htmlFor="expiryDays">Expiration Period (Days)</Label>
            <Input
              id="expiryDays"
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
              min="1"
              max="90"
            />
            <p className="text-xs text-muted-foreground">
              Number of days the update request will remain valid.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
