import { Mail, Globe, Users } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaFacebookF } from "react-icons/fa6";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DeveloperInfo() {
  const developers = [
    {
      name: "Md. Tamjid Hossen",
      // title: "Full Stack Developer",
      image: "/tamjidhossenProfile.png",
      bio: "Final year student at CSE, JKKNIU. Passionate about building scalable web applications and solving complex problems.",
      links: {
        github: "https://github.com/tamjidhossen",
        linkedin: "https://www.linkedin.com/in/tamjidhossen/",
        email: "tamjidhossen0x@gmail.com",
        facebook: "https://www.facebook.com/tamjidhossen0x/",
        portfolio: "https://github.com/tamjidhossen",
      },
    },
    {
      name: "Nabeel Ahsan ",
      // title: "Full Stack Developer",
      image: "/nabeelahsanProfile.jpeg",
      bio: "Final year student at CSE, JKKNIU. Passionate about building scalable web applications and solving complex problems.",
      links: {
        github: "https://github.com/Nabeel-Ahsan7",
        linkedin: "https://www.linkedin.com/in/nabeel-ahsan-229475252",
        email: "nabeelahsanofficial@gmail.com",
        facebook: "https://www.facebook.com/NA11.n",
        portfolio: "https://github.com/Nabeel-Ahsan7",
      },
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">
            Meet the Developers
          </h1>
          <div className="inline-block bg-emerald-100 dark:bg-emerald-800/40 px-3 py-1 rounded-full text-emerald-800 dark:text-emerald-300 text-sm font-medium mb-2">
            Research and Extension Center
          </div>
        </div>

        {/* Developer Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {developers.map((dev, index) => (
            <Card
              key={index}
              className="border-emerald-100 dark:border-emerald-800/50 shadow-sm"
            >
              <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20 text-center">
                <div className="flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-emerald-800/30 shadow-md">
                    <img
                      src={dev.image}
                      alt={dev.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <CardTitle className="mt-4 text-xl font-bold text-emerald-800 dark:text-emerald-400">
                  {dev.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-4 space-y-4">
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  {dev.bio}
                </p>

                {/* Social Links */}
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    size="icon"
                    variant="outline"
                    asChild
                    className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 dark:hover:text-emerald-300"
                  >
                    <a
                      href={dev.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                    >
                      <FaGithub className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    asChild
                    className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 dark:hover:text-emerald-300"
                  >
                    <a
                      href={dev.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                    >
                      <FaLinkedinIn className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    asChild
                    className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 dark:hover:text-emerald-300"
                  >
                    <a 
                      href={`mailto:${dev.links.email}`}
                      aria-label="Email"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    asChild
                    className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 dark:hover:text-emerald-300"
                  >
                    <a
                      href={dev.links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                    >
                      <FaFacebookF className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    asChild
                    className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 dark:hover:text-emerald-300"
                  >
                    <a
                      href={dev.links.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Portfolio"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}