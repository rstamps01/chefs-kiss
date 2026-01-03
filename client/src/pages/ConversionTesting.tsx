import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function ConversionTesting() {
  const [value, setValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("");
  const [toUnit, setToUnit] = useState<string>("");
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | undefined>(undefined);
  const [testResult, setTestResult] = useState<any>(null);

  const { data: units = [] } = trpc.conversionTesting.getSupportedUnits.useQuery();
  const { data: ingredients = [] } = trpc.conversionTesting.getIngredientsForTesting.useQuery();

  // Categorize units for grouped display
  const volumeUnits = units.filter(u => ['gal', 'l', 'ml', 'cup', 'tbsp', 'tsp', 'pt', 'qt', 'fl oz'].includes(u.name.toLowerCase()));
  const weightUnits = units.filter(u => ['oz', 'lb', 'kg', 'g'].includes(u.name.toLowerCase()));
  const pieceUnits = units.filter(u => ['pc', 'piece', 'pieces'].includes(u.name.toLowerCase()));
  // Exclude count types from conversion options
  const excludedUnits = ['doz', 'dozen', 'each', 'ea', 'sheet', 'roll'];

  // Determine category of selected From Unit
  const getUnitCategory = (unitName: string): 'volume' | 'weight' | 'piece' | null => {
    if (volumeUnits.some(u => u.name === unitName)) return 'volume';
    if (weightUnits.some(u => u.name === unitName)) return 'weight';
    if (pieceUnits.some(u => u.name === unitName)) return 'piece';
    return null;
  };

  const fromUnitCategory = fromUnit ? getUnitCategory(fromUnit) : null;

  // Check if a unit is compatible with the selected From Unit
  const isCompatible = (unitName: string): boolean => {
    if (!fromUnit) return true; // All enabled if no From Unit selected
    const toCategory = getUnitCategory(unitName);
    
    // Volume ↔ Volume: compatible
    if (fromUnitCategory === 'volume' && toCategory === 'volume') return true;
    // Weight ↔ Weight: compatible
    if (fromUnitCategory === 'weight' && toCategory === 'weight') return true;
    // Piece → Weight: compatible (requires ingredient data)
    if (fromUnitCategory === 'piece' && toCategory === 'weight') return true;
    // Weight → Piece: compatible (requires ingredient data)
    if (fromUnitCategory === 'weight' && toCategory === 'piece') return true;
    // All other combinations: incompatible
    return false;
  };

  const testConversion = trpc.conversionTesting.testConversion.useQuery(
    {
      value: parseFloat(value) || 1,
      fromUnit,
      toUnit,
      ingredientId: selectedIngredientId,
    },
    {
      enabled: false,
    }
  );

  const handleTest = async () => {
    if (!fromUnit || !toUnit) {
      return;
    }
    const result = await testConversion.refetch();
    setTestResult(result.data);
  };

  const selectedIngredient = ingredients.find(i => i.id === selectedIngredientId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Unit Conversion Testing</h1>
        <p className="text-muted-foreground mt-2">
          Test and validate unit conversions to identify gaps in the conversion system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Test</CardTitle>
            <CardDescription>
              Enter values and units to test conversion accuracy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="1.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromUnit">From Unit</Label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger id="fromUnit">
                  <SelectValue placeholder="Select source unit" />
                </SelectTrigger>
                <SelectContent>
                  {volumeUnits.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Volume</SelectLabel>
                      {volumeUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.name}>
                          {unit.displayName} ({unit.name})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {weightUnits.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Weight</SelectLabel>
                      {weightUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.name}>
                          {unit.displayName} ({unit.name})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {pieceUnits.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Piece-Based</SelectLabel>
                      {pieceUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.name}>
                          {unit.displayName} ({unit.name})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toUnit">To Unit</Label>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger id="toUnit">
                  <SelectValue placeholder="Select target unit" />
                </SelectTrigger>
                <SelectContent>
                  {volumeUnits.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Volume</SelectLabel>
                      {volumeUnits.map((unit) => (
                        <SelectItem 
                          key={unit.id} 
                          value={unit.name}
                          disabled={!isCompatible(unit.name)}
                        >
                          {unit.displayName} ({unit.name})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {weightUnits.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Weight</SelectLabel>
                      {weightUnits.map((unit) => (
                        <SelectItem 
                          key={unit.id} 
                          value={unit.name}
                          disabled={!isCompatible(unit.name)}
                        >
                          {unit.displayName} ({unit.name})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {pieceUnits.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Piece-Based</SelectLabel>
                      {pieceUnits.map((unit) => (
                        <SelectItem 
                          key={unit.id} 
                          value={unit.name}
                          disabled={!isCompatible(unit.name)}
                        >
                          {unit.displayName} ({unit.name})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredient">Ingredient (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Required for piece (pc) or cup conversions
              </p>
              <Select
                value={selectedIngredientId?.toString()}
                onValueChange={(val) => setSelectedIngredientId(val ? parseInt(val) : undefined)}
              >
                <SelectTrigger id="ingredient">
                  <SelectValue placeholder="Select ingredient (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ing) => (
                    <SelectItem key={ing.id} value={ing.id.toString()}>
                      {ing.name} ({ing.unit})
                      {ing.pieceWeightOz && ` - ${ing.pieceWeightOz}oz/pc`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedIngredientId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIngredientId(undefined)}
                  className="text-xs"
                >
                  Clear selection
                </Button>
              )}
            </div>

            {selectedIngredient && selectedIngredient.pieceWeightOz && (
              <Alert>
                <AlertDescription>
                  <strong>{selectedIngredient.name}</strong> has a piece weight of{" "}
                  <strong>{selectedIngredient.pieceWeightOz} oz per piece</strong>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleTest}
              disabled={!fromUnit || !toUnit || testConversion.isFetching}
              className="w-full"
            >
              {testConversion.isFetching ? "Testing..." : "Test Conversion"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Result</CardTitle>
            <CardDescription>
              View conversion output and diagnostic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!testResult && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No test results yet</p>
                <p className="text-sm mt-2">Configure and run a test to see results</p>
              </div>
            )}

            {testResult && (
              <>
                {/* Success/Failure Indicator */}
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-600">Conversion Successful</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-600">Conversion Failed</span>
                    </>
                  )}
                </div>

                {/* Conversion Formula */}
                {testResult.success && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Conversion:</p>
                    <p className="text-lg font-mono">
                      {value} {testResult.fromUnit} = <strong>{testResult.result?.toFixed(4)}</strong> {testResult.toUnit}
                    </p>
                  </div>
                )}

                {/* Unit Type Information */}
                <div className="space-y-2">
                  <Label>Unit Types</Label>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {testResult.fromUnit}: {testResult.fromUnitType || "unknown"}
                    </Badge>
                    <ArrowRight className="h-4 w-4 self-center text-muted-foreground" />
                    <Badge variant="outline">
                      {testResult.toUnit}: {testResult.toUnitType || "unknown"}
                    </Badge>
                  </div>
                </div>

                {/* Compatibility */}
                <div className="space-y-2">
                  <Label>Unit Compatibility</Label>
                  <div className="flex items-center gap-2">
                    {testResult.compatible ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Units are compatible (mathjs supports direct conversion)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm">Units are not directly compatible (requires custom conversion)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ingredient Info */}
                {testResult.ingredientName && (
                  <div className="space-y-2">
                    <Label>Ingredient-Specific Conversion</Label>
                    <Alert>
                      <AlertDescription>
                        <strong>{testResult.ingredientName}</strong>
                        {testResult.pieceWeightOz && (
                          <> - Piece weight: {testResult.pieceWeightOz} oz/piece</>
                        )}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Failure Reason */}
                {!testResult.success && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Conversion failed.</strong> Possible reasons:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Units are incompatible (e.g., weight ↔ volume without density)</li>
                        <li>Piece (pc) conversion requires ingredient with piece weight</li>
                        <li>Cup conversion requires ingredient-specific cup weight</li>
                        <li>Unit not supported by mathjs library</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Common Conversion Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Common Conversion Reference</CardTitle>
          <CardDescription>
            Quick reference for standard unit conversions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-semibold mb-2">Weight</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>1 lb = 16 oz</li>
                <li>1 kg = 1000 g</li>
                <li>1 lb ≈ 0.4536 kg</li>
                <li>1 oz ≈ 28.35 g</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Volume</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>1 gallon = 128 fl oz</li>
                <li>1 cup = 8 fl oz</li>
                <li>1 tbsp = 0.5 fl oz</li>
                <li>1 tsp = 0.167 fl oz</li>
                <li>1 liter = 1000 ml</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Special</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>pc → oz: Requires piece weight</li>
                <li>cup → oz: Requires ingredient density</li>
                <li>each/sheet: No conversion (1:1)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
