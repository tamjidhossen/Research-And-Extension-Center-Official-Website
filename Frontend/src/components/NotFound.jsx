import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation trigger
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-b from-white to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <div
        className={`transition-all duration-700 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* SVG Illustration */}
        <div className="w-full max-w-md mx-auto mb-8">
          <svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              {/* Research paper/documents */}
              <rect
                x="50"
                y="100"
                width="100"
                height="130"
                rx="5"
                fill="#e2e8f0"
                className="dark:fill-gray-700"
              />
              <rect
                x="60"
                y="115"
                width="80"
                height="5"
                rx="2"
                fill="#94a3b8"
                className="dark:fill-gray-500"
              />
              <rect
                x="60"
                y="130"
                width="60"
                height="5"
                rx="2"
                fill="#94a3b8"
                className="dark:fill-gray-500"
              />
              <rect
                x="60"
                y="145"
                width="70"
                height="5"
                rx="2"
                fill="#94a3b8"
                className="dark:fill-gray-500"
              />

              {/* Magnifying glass */}
              <circle
                cx="320"
                cy="140"
                r="70"
                stroke="#10b981"
                strokeWidth="8"
                fill="none"
                className="dark:stroke-emerald-500"
              />
              <line
                x1="370"
                y1="190"
                x2="400"
                y2="220"
                stroke="#10b981"
                strokeWidth="10"
                strokeLinecap="round"
                className="dark:stroke-emerald-500"
              />

              {/* Question marks */}
              <text
                x="200"
                y="120"
                fontSize="30"
                fontWeight="bold"
                fill="#10b981"
                className="dark:fill-emerald-500"
              >
                ?
              </text>
              <text
                x="250"
                y="150"
                fontSize="45"
                fontWeight="bold"
                fill="#10b981"
                className="dark:fill-emerald-500"
              >
                ?
              </text>
              <text
                x="180"
                y="180"
                fontSize="35"
                fontWeight="bold"
                fill="#10b981"
                className="dark:fill-emerald-500"
              >
                ?
              </text>
            </g>
          </svg>
        </div>

        <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 mb-2">
          404
        </h1>
        <h2 className="text-3xl font-semibold mt-2 mb-6 text-gray-800 dark:text-gray-100">
          Page Not Found
        </h2>
        <p className="max-w-md mx-auto text-gray-600 dark:text-gray-300 mb-8">
          We've searched everywhere but couldn't find the page you're looking
          for. It might have moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            <Link to="/">Return to Home</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-gray-800"
          >
            <Link to="/notices">View Notices</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
