import { describe, it, expect } from "vitest";
import { convertUnit } from "./unitConversion";

describe("Piece Weight Conversions", () => {
  it("should convert pieces to ounces using pieceWeightOz", async () => {
    // Simulate an ingredient with 1.5 oz per piece (like Salmon)
    const pieceWeightOz = 1.5;
    
    const result = convertUnit(5, "pc", "oz", pieceWeightOz);
    
    expect(result).toBe(7.5); // 5 pieces × 1.5 oz/piece = 7.5 oz
  });

  it("should convert pieces to pounds using pieceWeightOz", async () => {
    // Simulate an ingredient with 1.5 oz per piece
    const pieceWeightOz = 1.5;
    
    const result = convertUnit(10, "pc", "lb", pieceWeightOz);
    
    expect(result).toBeCloseTo(0.9375, 4); // 10 pieces × 1.5 oz = 15 oz = 0.9375 lb
  });

  it("should convert ounces to pounds (standard conversion, no piece weight needed)", async () => {
    const result = convertUnit(16, "oz", "lb");
    
    expect(result).toBe(1); // 16 oz = 1 lb
  });

  it("should convert gallons to fluid ounces (volume conversion)", async () => {
    const result = convertUnit(1, "gal", "fl oz");
    
    expect(result).toBe(128); // 1 gallon = 128 fluid ounces
  });

  it("should return null when converting pieces without pieceWeightOz", async () => {
    const result = convertUnit(5, "pc", "oz"); // No pieceWeightOz provided
    
    expect(result).toBeNull();
  });

  it("should return null when pieceWeightOz is zero", async () => {
    const result = convertUnit(5, "pc", "oz", 0);
    
    expect(result).toBeNull();
  });

  it("should return null when pieceWeightOz is negative", async () => {
    const result = convertUnit(5, "pc", "oz", -1.5);
    
    expect(result).toBeNull();
  });

  it("should handle large piece counts correctly", async () => {
    const pieceWeightOz = 2.5;
    
    const result = convertUnit(100, "pc", "lb", pieceWeightOz);
    
    expect(result).toBeCloseTo(15.625, 3); // 100 × 2.5 oz = 250 oz = 15.625 lb
  });
});
