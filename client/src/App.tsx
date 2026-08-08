import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import HomePage from "./pages/HomePage";
import CheckPage from "./pages/CheckPage";
import ComparPage from "./pages/ComparPage";
import InsurPage from "./pages/InsurPage";
import Step2Page from "./pages/Step2Page";
import Step3Page from "./pages/Step3Page";
import Step4Page from "./app/step4/page";
import Step5Page from "./app/step5/page";
import ThankYouPage from "./pages/ThankYouPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CookiesPage from "./pages/CookiesPage";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/home-new" component={HomePage} />
      <Route path="/check" component={CheckPage} />
      <Route path="/compar" component={ComparPage} />
      <Route path="/insur" component={InsurPage} />
      <Route path="/step2" component={Step2Page} />
      <Route path="/step3" component={Step3Page} />
      <Route path="/step4" component={Step4Page} />
      <Route path="/step5" component={Step5Page} />
      <Route path="/thank-you" component={ThankYouPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/cookies" component={CookiesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
