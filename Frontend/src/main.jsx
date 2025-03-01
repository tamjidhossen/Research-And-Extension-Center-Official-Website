import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./components/Home/Home";
import Layout from "./Layout";
import StudentSubmission from "./components/Submit/Student";
import TeacherSubmission from "./components/Submit/Teacher";
import Notices from "./components/Notices/Notices";
import PrevProposals from "./components/Proposals/PrevProposals";

import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />}>
        <Route path="" element={<Home />} />
        <Route path="submit/student" element={<StudentSubmission />} />
        <Route path="submit/teacher" element={<TeacherSubmission />} />
        <Route path="notices" element={<Notices />} />
        <Route path="proposals" element={<PrevProposals />} />
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
