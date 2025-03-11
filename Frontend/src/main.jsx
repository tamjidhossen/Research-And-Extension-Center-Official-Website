import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./components/Home/Home";
import Layout from "./Layout";
import StudentSubmission from "./components/Submit/Student";
import TeacherSubmission from "./components/Submit/Teacher";
import Notices from "./components/Notices/Notices";
import PrevProposals from "./components/Proposals/PrevProposals";
import AdminLogin from './components/Admin/Login'
import Dashboard from './components/Admin/Dashboard'
import ProtectedRoute from './components/Admin/ProtectedRoute'
import AdminRegister from './components/Admin/Register'
import ReviewerPage from './components/Reviewer/ReviewerPage';
import InvoiceSubmissionPage from './components/Reviewer/InvoiceSubmission';
import NoticeManagerLogin from './components/NoticeManager/Login';
import NoticeManagerDashboard from './components/NoticeManager/Dashboard';
import NoticeManagerProtectedRoute from './components/NoticeManager/ProtectedRoute';
import NotFound from './components/NotFound';

import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />} errorElement={<NotFound />}>
        <Route path="" element={<Home />} />
        <Route path="submit/student" element={<StudentSubmission />} />
        <Route path="submit/teacher" element={<TeacherSubmission />} />
        <Route path="notices" element={<Notices />} />
        <Route path="archive" element={<PrevProposals />} />
        <Route path="review" element={<ReviewerPage />} />
        <Route path="invoice/upload" element={<InvoiceSubmissionPage />} />
        {/* Catch-all route for the Layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin" errorElement={<NotFound />}>
        <Route path="register" element={<AdminRegister />} />
        <Route path="login" element={<AdminLogin />} />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        {/* Catch-all route for the Layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/notice-manager" errorElement={<NotFound />}>
        <Route path="login" element={<NoticeManagerLogin />} />
        <Route 
          path="dashboard" 
          element={
            <NoticeManagerProtectedRoute>
              <NoticeManagerDashboard />
            </NoticeManagerProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
