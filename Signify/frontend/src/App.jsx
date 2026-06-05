import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/Authcontext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SignDetector from "./pages/SignDetector";
import SignToText from "./pages/SignToText";
import TextToSign from "./pages/TextToSign";
import FileToSign from "./pages/FileToSign";

function ProtectedRoute({ children }) {
  return children;
}

function PublicRoute({ children }) {
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/detector" element={<ProtectedRoute><SignDetector /></ProtectedRoute>} />
          <Route path="/dashboard/signtotext" element={<ProtectedRoute><SignToText /></ProtectedRoute>} />
          <Route path="/dashboard/texttosign" element={<ProtectedRoute><TextToSign /></ProtectedRoute>} />
          <Route path="/dashboard/filetosign" element={<ProtectedRoute><FileToSign /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
