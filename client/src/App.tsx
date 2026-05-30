import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import TeacherLogin from "@/pages/TeacherLogin";
import TeacherDashboard from "@/pages/TeacherDashboard";
import StudentDetail from "@/pages/StudentDetail";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppQuiz from "./AppQuiz";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppQuiz} />
      <Route path="/teacher-login" component={TeacherLogin} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/teacher/student/:name" component={StudentDetail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
