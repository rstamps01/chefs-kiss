import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Upload, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { CSVImportModal } from '@/components/CSVImportModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocation } from 'wouter';

type WizardStep = 'ingredients' | 'recipes' | 'recipeIngredients' | 'complete';

interface StepStatus {
  ingredients: {
    completed: boolean;
    recordsImported: number;
  };
  recipes: {
    completed: boolean;
    recordsImported: number;
  };
  recipeIngredients: {
    completed: boolean;
    recordsImported: number;
  };
}

export function DataMigrationWizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<WizardStep>('ingredients');
  const [stepStatus, setStepStatus] = useState<StepStatus>({
    ingredients: { completed: false, recordsImported: 0 },
    recipes: { completed: false, recordsImported: 0 },
    recipeIngredients: { completed: false, recordsImported: 0 },
  });
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<'ingredients' | 'recipes' | 'recipeIngredients'>('ingredients');

  const steps: Array<{ id: WizardStep; title: string; description: string }> = [
    {
      id: 'ingredients',
      title: 'Step 1: Import Ingredients',
      description: 'Import your ingredient list with names, categories, suppliers, and costs',
    },
    {
      id: 'recipes',
      title: 'Step 2: Import Recipes',
      description: 'Import your recipes with names, categories, and pricing information',
    },
    {
      id: 'recipeIngredients',
      title: 'Step 3: Link Recipe Ingredients',
      description: 'Connect recipes to their ingredients with quantities and units',
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Data migration completed successfully',
    },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleImportClick = (type: 'ingredients' | 'recipes' | 'recipeIngredients') => {
    setImportType(type);
    setShowImportModal(true);
  };

  const handleImportSuccess = (created: number, updated: number) => {
    const totalRecords = created + updated;
    
    setStepStatus(prev => ({
      ...prev,
      [importType]: {
        completed: true,
        recordsImported: totalRecords,
      },
    }));

    setShowImportModal(false);

    // Auto-advance to next step
    if (importType === 'ingredients') {
      setCurrentStep('recipes');
    } else if (importType === 'recipes') {
      setCurrentStep('recipeIngredients');
    } else if (importType === 'recipeIngredients') {
      setCurrentStep('complete');
    }
  };

  const handleNext = () => {
    if (currentStep === 'ingredients' && stepStatus.ingredients.completed) {
      setCurrentStep('recipes');
    } else if (currentStep === 'recipes' && stepStatus.recipes.completed) {
      setCurrentStep('recipeIngredients');
    } else if (currentStep === 'recipeIngredients' && stepStatus.recipeIngredients.completed) {
      setCurrentStep('complete');
    }
  };

  const handlePrevious = () => {
    if (currentStep === 'recipes') {
      setCurrentStep('ingredients');
    } else if (currentStep === 'recipeIngredients') {
      setCurrentStep('recipes');
    }
  };

  const handleSkip = () => {
    if (currentStep === 'ingredients') {
      setCurrentStep('recipes');
    } else if (currentStep === 'recipes') {
      setCurrentStep('recipeIngredients');
    }
  };

  const getStepIcon = (stepId: WizardStep) => {
    if (stepId === 'complete') return null;
    
    const status = stepStatus[stepId as keyof Omit<StepStatus, 'complete'>];
    if (status.completed) {
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    }
    return <Circle className="h-6 w-6 text-muted-foreground" />;
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Migration Wizard</h1>
        <p className="text-muted-foreground">
          Follow these steps to import your restaurant data. Complete each step before moving to the next.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 mb-2 ${
                index <= currentStepIndex
                  ? 'border-primary bg-primary/10'
                  : 'border-muted bg-muted'
              }`}
            >
              {step.id !== 'complete' ? (
                getStepIcon(step.id)
              ) : (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div className="text-xs font-medium text-center">{step.title.split(':')[0]}</div>
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      {currentStep !== 'complete' ? (
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStepIndex].title}</CardTitle>
            <CardDescription>{steps[currentStepIndex].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 'ingredients' && !stepStatus.ingredients.completed && (
              <Alert>
                <AlertDescription>
                  <strong>Before you start:</strong> Prepare a CSV file with columns: name, category, supplier, unit, cost_per_unit, piece_weight, min_stock_level
                </AlertDescription>
              </Alert>
            )}
            
            {currentStep === 'recipes' && !stepStatus.recipes.completed && (
              <Alert>
                <AlertDescription>
                  <strong>Before you start:</strong> Prepare a CSV file with columns: name, category, description, prep_time, cook_time, servings, cost, price
                </AlertDescription>
              </Alert>
            )}
            
            {currentStep === 'recipeIngredients' && !stepStatus.recipeIngredients.completed && (
              <Alert>
                <AlertDescription>
                  <strong>Before you start:</strong> Prepare a CSV file with columns: recipe_id, ingredient_id, quantity, unit. You'll need the IDs from the previous imports.
                </AlertDescription>
              </Alert>
            )}

            {stepStatus[currentStep as keyof Omit<StepStatus, 'complete'>]?.completed ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">Step Completed</div>
                  <div className="text-sm text-green-700">
                    {stepStatus[currentStep as keyof Omit<StepStatus, 'complete'>].recordsImported} records imported successfully
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => handleImportClick(currentStep as 'ingredients' | 'recipes' | 'recipeIngredients')}
                className="w-full"
                size="lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                Import {currentStep === 'ingredients' ? 'Ingredients' : currentStep === 'recipes' ? 'Recipes' : 'Recipe Ingredients'}
              </Button>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 'ingredients'}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {!stepStatus[currentStep as keyof Omit<StepStatus, 'complete'>]?.completed && (
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip for Now
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!stepStatus[currentStep as keyof Omit<StepStatus, 'complete'>]?.completed}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Migration Complete!
            </CardTitle>
            <CardDescription>
              Your data has been successfully imported into the system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border">
                <div className="text-2xl font-bold text-blue-900">
                  {stepStatus.ingredients.recordsImported}
                </div>
                <div className="text-sm text-blue-700">Ingredients</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border">
                <div className="text-2xl font-bold text-purple-900">
                  {stepStatus.recipes.recordsImported}
                </div>
                <div className="text-sm text-purple-700">Recipes</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border">
                <div className="text-2xl font-bold text-green-900">
                  {stepStatus.recipeIngredients.recordsImported}
                </div>
                <div className="text-sm text-green-700">Recipe Links</div>
              </div>
            </div>

            <Button onClick={() => setLocation('/dashboard')} className="w-full" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <CSVImportModal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          type={importType}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
