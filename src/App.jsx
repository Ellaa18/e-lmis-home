
import React from "react";

import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import ApplicationPage from "./pages/ApplicationPage";
import DubaiForm from "./pages/DubaiForm";
import KuwaitForm from "./pages/KuwaitForm";
import CanadaForm from "./pages/CanadaForm";

function App() {
  let currentPath = window.location.pathname;

  // Remove trailing slashes
  while (currentPath.length > 1 && currentPath.endsWith("/")) {
    currentPath = currentPath.slice(0, -1);
  }

  // Admin page
  if (currentPath === "/admin") {
    return <AdminPage />;
  }

  // Dubai application form
  if (currentPath === "/application/dubai") {
    return <DubaiForm />;
  }

  // Kuwait application form
  if (currentPath === "/application/kuwait") {
    return <KuwaitForm />;
  }

  // Canada application form
  if (currentPath === "/application/canada") {
    return <CanadaForm />;
  }

  // Destination selection page
  if (currentPath === "/application") {
    return <ApplicationPage />;
  }

  // Home page
  return <HomePage />;
}

export default App;
