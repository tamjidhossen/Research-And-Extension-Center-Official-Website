import React from "react";
import { NavLink } from "react-router-dom";
import { FaFacebook, FaEnvelope } from "react-icons/fa"; // Importing icons from react-icons

const Footer = () => {
  return (
    <footer className="p-4 py-8 mt-auto border-t-2 dark:bg-gradient-to-b dark:from-green-950/20 dark:backdrop-blur-sm backdrop-blur-xs border-gray-200/50 dark:border-gray-800/20">
      <div className="container mx-auto flex flex-col md:flex-row justify-between gap-6 px-4">
        <div className="footer-section mb-6 md:mb-0">
          <h3 className="text-lg font-semibold mb-2 dark:text-gray-100 text-gray-800">
            About Us
          </h3>
          <p className="text-sm md:text-base dark:text-gray-300 text-gray-600">
            REC
          </p>
        </div>
        <div className="footer-section mb-6 md:mb-0">
          <h3 className="text-lg font-semibold mb-2 ">Links</h3>
          <ul className="list-none space-y-2">
            <li className="text-sm md:text-base">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "text-green-400" : "text-gray-400 hover:text-gray-500"
                }
              >
                Home
              </NavLink>
            </li>
            <li className="text-sm md:text-base">
              <NavLink
                to="/registration"
                className={({ isActive }) =>
                  isActive ? "text-green-400" : "text-gray-400 hover:text-gray-500"
                }
              >
                Registration
              </NavLink>
            </li>
            <li className="text-sm md:text-base">
              <NavLink
                to="/announcements"
                className={({ isActive }) =>
                  isActive ? "text-green-400" : "text-gray-400 hover:text-gray-500"
                }
              >
                Announcements
              </NavLink>
            </li>
            <li className="text-sm md:text-base">
              <NavLink
                to="/developer-info"
                className={({ isActive }) =>
                  isActive ? "text-green-400" : "text-gray-400 hover:text-gray-500"
                }
              >
                Developer Info
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="text-lg font-semibold mb-2 ">
            Contact Us
          </h3>
          <p className="text-sm md:text-base ">
            Email:{" "}
            <a
              href="mailto:info@example.com"
              className="text-gray-400 hover:text-gray-500"
            >
              habiburfbjkkniu@gmail.com
            </a>
          </p>
          <p className="text-sm md:text-base ">
            Phone: <span className="text-gray-400">012345678910</span>
          </p>
          <div className="flex space-x-4 mt-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-500"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href="mailto:msujanali@gmail.com"
              className="text-gray-400 hover:text-gray-500"
            >
              <FaEnvelope size={24} />
            </a>
          </div>
        </div>
      </div>
      <div className="text-center mt-6 text-sm md:text-base">
        &copy; 2025 JKKNIU REC. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
