import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import SampleTracking from "./pages/SampleTracking";
import ResultsEntry from "./pages/ResultsEntry";
import ReportEditor from "./pages/ReportEditor";
import Verification from "./pages/Verification";
import Patients from "./pages/Patients";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/samples" element={<SampleTracking />} />
          <Route path="/results" element={<ResultsEntry />} />
          <Route path="/reports" element={<ReportEditor />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/patients" element={<Patients />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
