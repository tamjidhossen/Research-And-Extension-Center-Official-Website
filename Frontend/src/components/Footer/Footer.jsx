// src/components/Footer/Footer.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FaFacebook, FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="py-12 mt-auto border-t border-emerald-200/30 dark:border-emerald-800/30 bg-gradient-to-b from-white to-emerald-50/30 dark:from-green-950/30 dark:to-green-900/5 dark:backdrop-blur-sm">
      <div className="container mx-auto flex flex-col md:flex-row justify-between gap-10 px-6">
        <div className="footer-section md:max-w-xs">
          <h3 className="text-xl font-semibold mb-4 text-emerald-800 dark:text-emerald-400">
            About JKKNIU REC
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            The Research and Extension Center at JKKNIU promotes academic excellence 
            through collaborative research initiatives and knowledge exchange between 
            faculty, students, and external stakeholders.
          </p>
        </div>
        
        <div className="footer-section">
          <h3 className="text-xl font-semibold mb-4 text-emerald-800 dark:text-emerald-400">
            Quick Links
          </h3>
          <ul className="list-none space-y-3">
            {[
              { to: "/", label: "Home" },
              { to: "/registration", label: "Registration" },
              { to: "/announcements", label: "Announcements" },
              { to: "/developer-info", label: "Developer Info" },
            ].map((link) => (
              <li key={link.label} className="text-sm md:text-base">
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center transition-colors duration-200 ${
                      isActive 
                      ? "text-emerald-600 font-medium dark:text-emerald-400" 
                      : "text-gray-600 hover:text-emerald-700 dark:text-gray-400 dark:hover:text-emerald-300"
                    }`
                  }
                >
                  <span className="border-b border-transparent hover:border-current">
                    {link.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="footer-section">
          <h3 className="text-xl font-semibold mb-4 text-emerald-800 dark:text-emerald-400">
            Contact Us
          </h3>
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
              <FaEnvelope className="text-emerald-600 dark:text-emerald-400" />
              <a
                href="mailto:habiburfbjkkniu@gmail.com"
                className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200"
              >
                habiburfbjkkniu@gmail.com
              </a>
            </p>
            <p className="flex items-center gap-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
              <FaPhone className="text-emerald-600 dark:text-emerald-400" />
              <span>012345678910</span>
            </p>
            <p className="flex items-center gap-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
              <FaMapMarkerAlt className="text-emerald-600 dark:text-emerald-400" />
              <span>JKKNIU Campus, Trishal, Mymensingh</span>
            </p>
            
            <div className="flex space-x-4 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-100 dark:bg-emerald-900/40 p-2.5 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 transition-colors duration-200"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="mailto:habiburfbjkkniu@gmail.com"
                className="bg-emerald-100 dark:bg-emerald-900/40 p-2.5 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 transition-colors duration-200"
                aria-label="Email"
              >
                <FaEnvelope size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto mt-10 pt-6 border-t border-emerald-100 dark:border-emerald-800/30">
        <div className="text-center text-sm md:text-base text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} JKKNIU Research and Extension Center. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;