import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Info, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Unit {
  unit: string;
  unitDisplayName: string | null;
}

interface UnitAccordionPickerProps {
  units: Unit[];
  selectedUnit: string;
  onSelectUnit: (unit: string) => void;
  disabledUnits?: Set<string>;
  label: string;
  disabledReason?: string; // Optional reason why units are disabled
}

export function UnitAccordionPicker({
  units,
  selectedUnit,
  onSelectUnit,
  disabledUnits = new Set(),
  label,
  disabledReason,
}: UnitAccordionPickerProps) {
  // Parent accordion state (controls visibility of all categories)
  const [isOpen, setIsOpen] = useState<string[]>([]);
  
  // Child accordion state (controls which category is expanded - only one at a time)
  const [openCategory, setOpenCategory] = useState<string[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Categorize units
  const volumeUnits = ["gal", "l", "ml", "cup", "tbsp", "tsp", "pt", "qt", "fl oz"];
  const weightUnits = ["oz", "lb", "kg", "g"];
  const pieceUnits = ["pc", "pieces", "ea", "each", "roll", "sheet"];

  const getUnitCategory = (unit: string): "volume" | "weight" | "piece" | "other" => {
    const normalized = unit.toLowerCase();
    if (volumeUnits.includes(normalized)) return "volume";
    if (weightUnits.includes(normalized)) return "weight";
    if (pieceUnits.includes(normalized)) return "piece";
    return "other";
  };

  const getDisplayText = (unit: Unit) => {
    // Display only the displayName since it already includes the abbreviation
    // e.g., "Cup (c)" instead of "Cup (c) (cup)"
    return unit.unitDisplayName || unit.unit;
  };

  // Filter units based on search query
  const filteredUnits = searchQuery
    ? units.filter((u) => {
        const displayText = getDisplayText(u).toLowerCase();
        const query = searchQuery.toLowerCase();
        return displayText.includes(query) || u.unit.toLowerCase().includes(query);
      })
    : units;

  const categorizedUnits = {
    volume: filteredUnits.filter((u) => getUnitCategory(u.unit) === "volume"),
    weight: filteredUnits.filter((u) => getUnitCategory(u.unit) === "weight"),
    piece: filteredUnits.filter((u) => getUnitCategory(u.unit) === "piece"),
  };

  const getSelectedDisplayText = () => {
    if (!selectedUnit) return `Select ${label.toLowerCase()}`;
    const unit = units.find((u) => u.unit === selectedUnit);
    return unit ? getDisplayText(unit) : selectedUnit;
  };

  // Auto-collapse: when a category is opened, close others
  const handleCategoryChange = (value: string[]) => {
    setOpenCategory(value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="border rounded-md">
        <div className="p-3 bg-muted/50 border-b">
          <div className="text-sm font-medium">{getSelectedDisplayText()}</div>
        </div>
        
        {/* Parent Accordion - wraps all categories */}
        <Accordion
          type="multiple"
          value={isOpen}
          onValueChange={setIsOpen}
          className="w-full"
        >
          <AccordionItem value="main" className="border-b-0">
            <AccordionTrigger className="px-3 py-2 hover:bg-muted/50">
              <span className="text-sm font-medium">
                Select {label.toLowerCase()}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              {/* Search Input */}
              <div className="px-3 py-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search units..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
              {/* Child Accordion - contains categories with auto-collapse */}
              <Accordion
                type="single"
                collapsible
                value={openCategory[0]}
                onValueChange={(value) => handleCategoryChange(value ? [value] : [])}
                className="w-full"
              >
                {/* Volume Section */}
                <AccordionItem value="volume" className="border-b-0">
                  <AccordionTrigger className="px-3 py-2 hover:bg-muted/50">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Volume
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="space-y-1 px-2 pb-2">
                      {categorizedUnits.volume.map((unit) => {
                        const isDisabled = disabledUnits.has(unit.unit);
                        const isSelected = selectedUnit === unit.unit;
                        const button = (
                          <Button
                            type="button"
                            key={unit.unit}
                            variant={isSelected ? "secondary" : "ghost"}
                            className={`w-full justify-between text-left h-auto py-2 ${
                              isDisabled ? "opacity-40 cursor-not-allowed" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) onSelectUnit(unit.unit);
                            }}
                            disabled={isDisabled}
                          >
                            <span className="text-sm flex items-center gap-2">
                              {getDisplayText(unit)}
                              {isDisabled && <Info className="h-3 w-3 text-muted-foreground" />}
                            </span>
                            {isSelected && <Check className="h-4 w-4" />}
                          </Button>
                        );
                        
                        return isDisabled && disabledReason ? (
                          <TooltipProvider key={unit.unit}>
                            <Tooltip>
                              <TooltipTrigger asChild>{button}</TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="text-xs">{disabledReason}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          button
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Weight Section */}
                <AccordionItem value="weight" className="border-b-0">
                  <AccordionTrigger className="px-3 py-2 hover:bg-muted/50">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Weight
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="space-y-1 px-2 pb-2">
                      {categorizedUnits.weight.map((unit) => {
                        const isDisabled = disabledUnits.has(unit.unit);
                        const isSelected = selectedUnit === unit.unit;
                        const button = (
                          <Button
                            type="button"
                            key={unit.unit}
                            variant={isSelected ? "secondary" : "ghost"}
                            className={`w-full justify-between text-left h-auto py-2 ${
                              isDisabled ? "opacity-40 cursor-not-allowed" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) onSelectUnit(unit.unit);
                            }}
                            disabled={isDisabled}
                          >
                            <span className="text-sm flex items-center gap-2">
                              {getDisplayText(unit)}
                              {isDisabled && <Info className="h-3 w-3 text-muted-foreground" />}
                            </span>
                            {isSelected && <Check className="h-4 w-4" />}
                          </Button>
                        );
                        
                        return isDisabled && disabledReason ? (
                          <TooltipProvider key={unit.unit}>
                            <Tooltip>
                              <TooltipTrigger asChild>{button}</TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="text-xs">{disabledReason}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          button
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Piece-Based Section */}
                <AccordionItem value="piece" className="border-b-0">
                  <AccordionTrigger className="px-3 py-2 hover:bg-muted/50">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Piece-Based
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="space-y-1 px-2 pb-2">
                      {categorizedUnits.piece.map((unit) => {
                        const isDisabled = disabledUnits.has(unit.unit);
                        const isSelected = selectedUnit === unit.unit;
                        const button = (
                          <Button
                            type="button"
                            key={unit.unit}
                            variant={isSelected ? "secondary" : "ghost"}
                            className={`w-full justify-between text-left h-auto py-2 ${
                              isDisabled ? "opacity-40 cursor-not-allowed" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) onSelectUnit(unit.unit);
                            }}
                            disabled={isDisabled}
                          >
                            <span className="text-sm flex items-center gap-2">
                              {getDisplayText(unit)}
                              {isDisabled && <Info className="h-3 w-3 text-muted-foreground" />}
                            </span>
                            {isSelected && <Check className="h-4 w-4" />}
                          </Button>
                        );
                        
                        return isDisabled && disabledReason ? (
                          <TooltipProvider key={unit.unit}>
                            <Tooltip>
                              <TooltipTrigger asChild>{button}</TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="text-xs">{disabledReason}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          button
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
