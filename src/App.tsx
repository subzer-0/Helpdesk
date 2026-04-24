import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { Layout } from "./components/Layout";
import { Protected } from "./components/Protected";
import { startWorker } from "./lib/jobs";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import Users from "./pages/Users";
import Workflow from "./pages/Workflow";
import EmailPage from "./pages/Email";
import Jobs from "./pages/Jobs";
import SettingsPage from "./pages/Settings";

function App() {
  useEffect(() => {
    startWorker();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Protected><Layout /></Protected>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/users" element={<Protected roles={["admin"]}><Users /></Protected>} />
              <Route path="/workflow" element={<Protected roles={["admin"]}><Workflow /></Protected>} />
              <Route path="/email" element={<Protected roles={["admin", "agent"]}><EmailPage /></Protected>} />
              <Route path="/jobs" element={<Protected roles={["admin", "agent"]}><Jobs /></Protected>} />
              <Route path="/settings" element={<Protected roles={["admin"]}><SettingsPage /></Protected>} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
