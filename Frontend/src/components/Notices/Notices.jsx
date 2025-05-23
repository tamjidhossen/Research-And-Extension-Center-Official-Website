import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ExternalLink,
  Loader2,
  FileText,
  Download,
  Bell,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

// Dummy notifications - will be replaced with API data later
const dummyNotices = [
  {
    _id: "notice-001",
    title: "Call for Research Proposals 2024-2025",
    description:
      "The Research and Extension Center (REC) is now accepting research proposals for the 2024-2025 fiscal year. Faculty members and students are encouraged to submit their innovative research ideas. Funding will be provided for selected proposals based on merit and alignment with university research priorities.",
    createdAt: "2024-02-28T09:30:00Z",
    category: "Announcement",
    hasAttachment: true,
    link: "#download-guidelines",
  },
  {
    _id: "notice-002",
    title: "Workshop on Research Methodology",
    description:
      "A three-day workshop on Research Methodology will be held from March 15-17, 2024. The workshop will cover qualitative and quantitative research methods, research design, data collection techniques, and analysis using SPSS and other statistical tools.\n\nVenue: Conference Hall, Admin Building\nTime: 10:00 AM - 4:00 PM",
    createdAt: "2024-02-25T14:15:00Z",
    category: "Event",
    hasAttachment: false,
    link: "#registration",
  },
  {
    _id: "notice-003",
    title: "Results of Student Research Grant 2023",
    description:
      "The results of the Student Research Grant 2023 have been published. A total of 15 student projects were selected for funding. Congratulations to all successful applicants! The first installment of funding will be disbursed by March 10, 2024. Selected students are requested to submit their acceptance forms by March 5, 2024.",
    createdAt: "2024-02-20T11:45:00Z",
    category: "Result",
    hasAttachment: true,
    link: "#results-pdf",
  },
  {
    _id: "notice-004",
    title: "Extension of Submission Deadline",
    description:
      "Due to numerous requests, the deadline for submitting faculty research proposals has been extended to April 15, 2024. Please ensure that all proposals follow the updated guidelines available on the REC website.",
    createdAt: "2024-02-18T16:30:00Z",
    category: "Update",
    hasAttachment: false,
  },
  {
    _id: "notice-005",
    title: "New Journal Publication Guidelines",
    description:
      "The Research and Extension Center has updated its journal publication guidelines. All researchers are requested to follow the new citation style and formatting requirements for submissions to the JKKNIU Journal of Research.\n\nThe new guidelines will take effect from March 1, 2024.",
    createdAt: "2024-02-15T10:00:00Z",
    category: "Policy",
    hasAttachment: true,
    link: "#guidelines",
  },
  {
    _id: "notice-006",
    title: "Annual Research Day 2024",
    description:
      "Mark your calendars! The Annual Research Day will be held on April 20, 2024. Faculty members and students who have completed research projects in the past year are invited to present their findings. Poster presentations and oral presentations will be featured.\n\nAbstract submission deadline: March 25, 2024",
    createdAt: "2024-02-10T13:20:00Z",
    category: "Event",
    hasAttachment: false,
    link: "#abstract-submission",
  },
];

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);

        // Uncomment to use actual API
        const response = await api.get("/api/notice/get-notice");
        setNotices(response.data);
        setLoading(false);

        // DUMMY DATA - Comment out when using actual API
        // const timer = setTimeout(() => {
        //   setNotices(dummyNotices);
        //   setLoading(false);
        // }, 800);

        // return () => clearTimeout(timer);
      } catch (err) {
        // console.error("Failed to fetch notices:", err);
        setError(err.response?.data?.message || "Failed to load notices");
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-4" />
        <p className="text-emerald-700 dark:text-emerald-300">
          Loading notices...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
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

  const baseUrl = import.meta.env.VITE_API_URL || "";
  const serverRoot = baseUrl.replace(/\/v1$/, "");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 dark:text-emerald-400">
          Notices & Announcements
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Stay updated with the latest news and announcements from JKKNIU
          Research and Extension Center
        </p>
        <div className="mt-2 h-1 w-24 bg-emerald-500 dark:bg-emerald-400 mx-auto rounded-full"></div>
      </div>

      {/* Cards Grid */}
      <div className="space-y-6">
        {notices.length === 0 ? (
          <Card className="text-center border-emerald-100 dark:border-emerald-800/50 shadow-sm">
            <CardContent className="pt-12 pb-12">
              <p className="text-gray-500 dark:text-gray-400">
                No notices available at the moment
              </p>
            </CardContent>
          </Card>
        ) : (
          notices.map((notice) => {
            return (
              <Card
                key={notice._id}
                className="group relative overflow-hidden border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="relative space-y-4 pb-2">
                  {/* Date Badge */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 text-sm text-emerald-600 dark:text-emerald-400">
                      <CalendarDays className="h-4 w-4" />
                      <time>{formatDate(notice.date || notice.createdAt)}</time>
                    </div>

                    {notice.files && notice.files.length > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-transparent border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 flex items-center gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        Attachment
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <CardTitle className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-400">
                      {notice.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                      {notice.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Show buttons for external link if exists */}
                  {notice.link && (
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-300 mr-2 mb-2"
                      >
                        <a
                          href={notice.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          Learn More
                          <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </a>
                      </Button>
                    </div>
                  )}

                  {/* Show buttons for each file attachment if exists */}
                  {notice.files &&
                    notice.files.length > 0 &&
                    notice.files.map((file, index) => {
                      // Convert regular number to Bengali numeral
                      const bengaliNumerals = [
                        "০",
                        "১",
                        "২",
                        "৩",
                        "৪",
                        "৫",
                        "৬",
                        "৭",
                        "৮",
                        "৯",
                      ];
                      const bengaliIndex = (index + 1)
                        .toString()
                        .split("")
                        .map((digit) => bengaliNumerals[parseInt(digit)])
                        .join("");

                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-300 mr-2 mb-2"
                        >
                          <a
                            href={`${serverRoot}/${file.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            বিজ্ঞপ্তি {bengaliIndex}
                          </a>
                        </Button>
                      );
                    })}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notices;
