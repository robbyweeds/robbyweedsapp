import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import Login from "./pages/Login";
import Main from "./pages/Main";
import CreateEntry from "./pages/CreateEntry";
import PastEntries from "./pages/PastEntries";
import EditEntry from "./pages/EditEntry";

function App() {
  const isAuthenticated = !!localStorage.getItem("user");

  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/main" element={isAuthenticated ? <Main /> : <Navigate to="/" replace />} />
          <Route path="/create" element={isAuthenticated ? <CreateEntry /> : <Navigate to="/" replace />} />
          <Route path="/past" element={isAuthenticated ? <PastEntries /> : <Navigate to="/" replace />} />
          <Route path="/edit/:id" element={isAuthenticated ? <EditEntry /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
