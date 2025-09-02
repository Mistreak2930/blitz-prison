import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Index from "./pages/Index";
import Forums from "./pages/Forums";
import News from "./pages/News";
import Announcements from "./pages/Announcements";
import Auth from "./pages/Auth";
import ForumCategory from "./pages/ForumCategory";
import Members from "./pages/Members";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import ModerationDashboard from "./pages/ModerationDashboard";
import Servers from "./pages/Servers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            
            <div className="flex-1 flex flex-col">
              <header className="h-12 flex items-center border-b border-border bg-background px-4">
                <SidebarTrigger className="h-8 w-8" />
              </header>
              
              <main className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/forums" element={<Forums />} />
                  <Route path="/forums/category/:id" element={<ForumCategory />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/announcements" element={<Announcements />} />
                  <Route path="/servers" element={<Servers />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/moderation" element={<ModerationDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
