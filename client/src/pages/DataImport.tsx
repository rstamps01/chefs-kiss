import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface FieldMapping {
  date: string;
  totalSales: string;
  totalOrders?: string;
  lunchSales?: string;
  dinnerSales?: string;
  notes?: string;
}

export default function DataImport() {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<FieldMapping>({
    date: '',
    totalSales: '',
  });
  const [validationResult, setValidationResult] = useState<any>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [step, setStep] = useState<'upload' | 'map' | 'validate' | 'import'>('upload');

  const { data: locations } = trpc.restaurant.locations.useQuery();
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  const parseAndValidate = trpc.csvImport.parseAndValidate.useMutation();
  const importData = trpc.csvImport.import.useMutation();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);

      // Parse headers
      const lines = content.trim().split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        setCsvHeaders(headers);

        // Auto-detect common field names
        const autoMapping: FieldMapping = {
          date: headers.find(h => /date/i.test(h)) || '',
          totalSales: headers.find(h => /(total|sales|revenue)/i.test(h)) || '',
          totalOrders: headers.find(h => /(orders|transactions|count)/i.test(h)),
          lunchSales: headers.find(h => /lunch/i.test(h)),
          dinnerSales: headers.find(h => /dinner/i.test(h)),
          notes: headers.find(h => /notes?/i.test(h)),
        };
        setMapping(autoMapping);
        setStep('map');
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleValidate = async () => {
    if (!mapping.date || !mapping.totalSales) {
      toast.error('Date and Total Sales fields are required');
      return;
    }

    try {
      const result = await parseAndValidate.mutateAsync({
        csvContent,
        mapping,
      });

      setValidationResult(result.validation);
      setPreview(result.preview);

      if (result.validation.valid) {
        toast.success(`CSV validated! ${result.rowCount} rows ready to import`);
        setStep('validate');
      } else {
        toast.error(`Validation failed: ${result.validation.errors.length} errors found`);
        setStep('validate');
      }
    } catch (error: any) {
      toast.error(error.message || 'Validation failed');
    }
  };

  const handleImport = async () => {
    if (!selectedLocationId) {
      toast.error('Please select a location');
      return;
    }

    if (!validationResult?.valid) {
      toast.error('Please fix validation errors before importing');
      return;
    }

    try {
      const result = await importData.mutateAsync({
        locationId: selectedLocationId,
        csvContent,
        mapping,
      });

      toast.success(`Successfully imported ${result.imported} rows!`);
      if (result.warnings.length > 0) {
        toast.info(`${result.warnings.length} warnings (optional fields skipped)`);
      }

      // Reset form
      setFile(null);
      setCsvContent('');
      setCsvHeaders([]);
      setMapping({ date: '', totalSales: '' });
      setValidationResult(null);
      setPreview([]);
      setStep('upload');
    } catch (error: any) {
      toast.error(error.message || 'Import failed');
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import POS Data</h1>
        <p className="text-muted-foreground">
          Upload sales data from your POS system in CSV format
        </p>
      </div>

      {/* Location Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Location</CardTitle>
          <CardDescription>Choose which location this data belongs to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="location">Location</Label>
            <Select
              value={selectedLocationId?.toString() || ''}
              onValueChange={(value) => setSelectedLocationId(parseInt(value))}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: File Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Step 1: Upload CSV File
            </CardTitle>
            <CardDescription>
              Select a CSV file exported from your POS system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-lg font-semibold mb-2">
                  {file ? file.name : 'Choose a CSV file'}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  or drag and drop it here
                </div>
                <Button type="button" variant="outline">
                  Browse Files
                </Button>
              </Label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Field Mapping */}
      {step === 'map' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Map CSV Fields</CardTitle>
            <CardDescription>
              Match your CSV columns to Chef's Kiss data fields
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Field Mapping</AlertTitle>
              <AlertDescription>
                Date and Total Sales are required. Other fields are optional but recommended for better analytics.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required Fields */}
              <div>
                <Label htmlFor="date-field">Date *</Label>
                <Select value={mapping.date} onValueChange={(value) => setMapping({ ...mapping, date: value })}>
                  <SelectTrigger id="date-field">
                    <SelectValue placeholder="Select date column" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sales-field">Total Sales *</Label>
                <Select value={mapping.totalSales} onValueChange={(value) => setMapping({ ...mapping, totalSales: value })}>
                  <SelectTrigger id="sales-field">
                    <SelectValue placeholder="Select sales column" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Optional Fields */}
              <div>
                <Label htmlFor="orders-field">Total Orders (Optional)</Label>
                <Select value={mapping.totalOrders || ''} onValueChange={(value) => setMapping({ ...mapping, totalOrders: value || undefined })}>
                  <SelectTrigger id="orders-field">
                    <SelectValue placeholder="Select orders column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lunch-field">Lunch Sales (Optional)</Label>
                <Select value={mapping.lunchSales || ''} onValueChange={(value) => setMapping({ ...mapping, lunchSales: value || undefined })}>
                  <SelectTrigger id="lunch-field">
                    <SelectValue placeholder="Select lunch sales column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dinner-field">Dinner Sales (Optional)</Label>
                <Select value={mapping.dinnerSales || ''} onValueChange={(value) => setMapping({ ...mapping, dinnerSales: value || undefined })}>
                  <SelectTrigger id="dinner-field">
                    <SelectValue placeholder="Select dinner sales column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes-field">Notes (Optional)</Label>
                <Select value={mapping.notes || ''} onValueChange={(value) => setMapping({ ...mapping, notes: value || undefined })}>
                  <SelectTrigger id="notes-field">
                    <SelectValue placeholder="Select notes column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setStep('upload')} variant="outline">
                Back
              </Button>
              <Button onClick={handleValidate} disabled={!mapping.date || !mapping.totalSales || parseAndValidate.isPending}>
                {parseAndValidate.isPending ? 'Validating...' : 'Validate & Preview'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Validation & Preview */}
      {step === 'validate' && validationResult && (
        <div className="space-y-6">
          {/* Validation Results */}
          {validationResult.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors ({validationResult.errors.length})</AlertTitle>
              <AlertDescription>
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {validationResult.errors.slice(0, 10).map((error: any, index: number) => (
                    <div key={index} className="text-sm">
                      Row {error.row}: {error.field} - {error.message}
                    </div>
                  ))}
                  {validationResult.errors.length > 10 && (
                    <div className="text-sm font-semibold">
                      ... and {validationResult.errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validationResult.warnings.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Warnings ({validationResult.warnings.length})</AlertTitle>
              <AlertDescription>
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {validationResult.warnings.slice(0, 5).map((warning: any, index: number) => (
                    <div key={index} className="text-sm">
                      Row {warning.row}: {warning.field} - {warning.message}
                    </div>
                  ))}
                  {validationResult.warnings.length > 5 && (
                    <div className="text-sm font-semibold">
                      ... and {validationResult.warnings.length - 5} more warnings
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validationResult.valid && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Validation Passed</AlertTitle>
              <AlertDescription className="text-green-600">
                All data is valid and ready to import
              </AlertDescription>
            </Alert>
          )}

          {/* Preview Table */}
          <Card>
            <CardHeader>
              <CardTitle>Data Preview (First 10 Rows)</CardTitle>
              <CardDescription>Review your data before importing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Sales</TableHead>
                      <TableHead>Total Orders</TableHead>
                      <TableHead>Lunch Sales</TableHead>
                      <TableHead>Dinner Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>${row.totalSales.toFixed(2)}</TableCell>
                        <TableCell>{row.totalOrders}</TableCell>
                        <TableCell>{row.lunchSales ? `$${row.lunchSales.toFixed(2)}` : '-'}</TableCell>
                        <TableCell>{row.dinnerSales ? `$${row.dinnerSales.toFixed(2)}` : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={() => setStep('map')} variant="outline">
              Back to Mapping
            </Button>
            <Button
              onClick={handleImport}
              disabled={!validationResult.valid || !selectedLocationId || importData.isPending}
            >
              {importData.isPending ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
