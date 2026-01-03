import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Forecasting from "./pages/Forecasting";
import PrepPlanning from "./pages/PrepPlanning";
import Recipes from "./pages/Recipes";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import RecipeIngredientsView from "./pages/RecipeIngredientsView";
import AddRecipeForm from "./pages/AddRecipeForm";
import DataImport from "./pages/DataImport";
import ConversionTesting from "./pages/ConversionTesting";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/recipes-view" component={RecipeIngredientsView} />
      <Route path="/recipes/add" component={AddRecipeForm} />
      <Route path="/dashboard">
        <DashboardLayout>
          <Analytics />
        </DashboardLayout>
      </Route>
      <Route path="/analytics">
        <DashboardLayout>
          <Analytics />
        </DashboardLayout>
      </Route>
      <Route path="/forecasting">
        <DashboardLayout>
          <Forecasting />
        </DashboardLayout>
      </Route>
      <Route path="/prep-planning">
        <DashboardLayout>
          <PrepPlanning />
        </DashboardLayout>
      </Route>
      <Route path="/recipes">
        <DashboardLayout>
          <Recipes />
        </DashboardLayout>
      </Route>
      <Route path="/data-import">
        <DashboardLayout>
          <DataImport />
        </DashboardLayout>
      </Route>
      <Route path="/reports">
        <DashboardLayout>
          <Reports />
        </DashboardLayout>
      </Route>
      <Route path="/settings">
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      </Route>
      <Route path="/conversion-testing">
        <DashboardLayout>
          <ConversionTesting />
        </DashboardLayout>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
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
