// src/components/Home/Home.jsx
import { ArrowRight, BookOpen, FileText, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-700 dark:from-emerald-950 dark:to-emerald-800 text-white p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Welcome to the Research & Extension Center
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 mb-8 leading-relaxed">
            Empowering innovative research, fostering academic excellence, and facilitating knowledge exchange at JKKNIU.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50">
              Submit Research Proposal
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-800">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Our Services
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <BookOpen className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />,
              title: "Research Proposals",
              description: "Submit your research proposals online for review by our expert panel."
            },
            {
              icon: <FileText className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />,
              title: "Publication Support",
              description: "Get assistance for publishing your research in reputed journals."
            },
            {
              icon: <Users className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />,
              title: "Collaboration",
              description: "Connect with researchers and experts from various disciplines."
            },
            {
              icon: <Download className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />,
              title: "Resource Access",
              description: "Access a wide range of research resources, tools, and datasets."
            }
          ].map((service, index) => (
            <Card key={index} className="border-emerald-100 dark:border-emerald-900/50 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="mb-4">{service.icon}</div>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">About REC</h2>
            <p className="text-gray-700 dark:text-gray-300">
              The Research and Extension Center (REC) at Jatiya Kabi Kazi Nazrul Islam University (JKKNIU) 
              was established with the aim to foster a culture of research excellence and innovation.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Our mission is to provide high-quality research and extension services to improve 
              the quality of academic output and contribute to society through innovative research solutions.
            </p>
            <Button variant="outline" className="mt-2">
              Learn More About Us
            </Button>
          </div>
          <div className="md:w-1/2 bg-emerald-200/50 dark:bg-emerald-800/30 rounded-lg flex items-center justify-center">
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-4 text-emerald-800 dark:text-emerald-300">Research Focus Areas</h3>
              <ul className="space-y-2 text-left list-disc list-inside">
                <li>Sustainable Development</li>
                <li>Information Technology</li>
                <li>Environmental Science</li>
                <li>Social Sciences</li>
                <li>Arts and Humanities</li>
                <li>Basic Sciences</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}