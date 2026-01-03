import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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
}

export function UnitAccordionPicker({
  units,
  selectedUnit,
  onSelectUnit,
  disabledUnits = new Set(),
  label,
}: UnitAccordionPickerProps) {
  const [openSections, setOpenSections] = useState<string[]>(["volume", "weight", "piece"]);

  // Categorize units
  const volumeUnits = ["gal", "l", "ml", "cup", "tbsp", "tsp", "pt", "qt", "fl oz"];
  const weightUnits = ["oz", "lb", "kg", "g"];
  const pieceUnits = ["pc", "pieces"];

  const getUnitCategory = (unit: string): "volume" | "weight" | "piece" | "other" => {
    const normalized = unit.toLowerCase();
    if (volumeUnits.includes(normalized)) return "volume";
    if (weightUnits.includes(normalized)) return "weight";
    if (pieceUnits.includes(normalized)) return "piece";
    return "other";
  };

  const categorizedUnits = {
    volume: units.filter((u) => getUnitCategory(u.unit) === "volume"),
    weight: units.filter((u) => getUnitCategory(u.unit) === "weight"),
    piece: units.filter((u) => getUnitCategory(u.unit) === "piece"),
  };

  const getDisplayText = (unit: Unit) => {
    return unit.unitDisplayName
      ? `${unit.unitDisplayName} (${unit.unit})`
      : unit.unit;
  };

  const getSelectedDisplayText = () => {
    if (!selectedUnit) return `Select ${label.toLowerCase()}`;
    const unit = units.find((u) => u.unit === selectedUnit);
    return unit ? getDisplayText(unit) : selectedUnit;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="border rounded-md">
        <div className="p-3 bg-muted/50 border-b">
          <div className="text-sm font-medium">{getSelectedDisplayText()}</div>
        </div>
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={setOpenSections}
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
                  return (
                    <Button
                      key={unit.unit}
                      variant={isSelected ? "secondary" : "ghost"}
                      className={`w-full justify-between text-left h-auto py-2 ${
                        isDisabled ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                      onClick={() => !isDisabled && onSelectUnit(unit.unit)}
                      disabled={isDisabled}
                    >
                      <span className="text-sm">{getDisplayText(unit)}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </Button>
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
                  return (
                    <Button
                      key={unit.unit}
                      variant={isSelected ? "secondary" : "ghost"}
                      className={`w-full justify-between text-left h-auto py-2 ${
                        isDisabled ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                      onClick={() => !isDisabled && onSelectUnit(unit.unit)}
                      disabled={isDisabled}
                    >
                      <span className="text-sm">{getDisplayText(unit)}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </Button>
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
                  return (
                    <Button
                      key={unit.unit}
                      variant={isSelected ? "secondary" : "ghost"}
                      className={`w-full justify-between text-left h-auto py-2 ${
                        isDisabled ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                      onClick={() => !isDisabled && onSelectUnit(unit.unit)}
                      disabled={isDisabled}
                    >
                      <span className="text-sm">{getDisplayText(unit)}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </Button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
