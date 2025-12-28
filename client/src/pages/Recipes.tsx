import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

export default function Recipes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipe Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage menu items and their ingredient requirements
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* Recipe List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "California Roll",
            category: "Sushi Rolls",
            ingredients: 8,
            cost: "$4.50",
            price: "$12.95",
            margin: "65%"
          },
          {
            name: "Spicy Tuna Roll",
            category: "Sushi Rolls",
            ingredients: 7,
            cost: "$5.20",
            price: "$14.95",
            margin: "65%"
          },
          {
            name: "Salmon Nigiri (2pc)",
            category: "Nigiri",
            ingredients: 3,
            cost: "$3.80",
            price: "$8.95",
            margin: "58%"
          },
          {
            name: "Tuna Sashimi (5pc)",
            category: "Sashimi",
            ingredients: 2,
            cost: "$6.50",
            price: "$16.95",
            margin: "62%"
          },
          {
            name: "Dragon Roll",
            category: "Specialty Rolls",
            ingredients: 10,
            cost: "$7.20",
            price: "$18.95",
            margin: "62%"
          },
          {
            name: "Miso Soup",
            category: "Appetizers",
            ingredients: 5,
            cost: "$1.20",
            price: "$3.95",
            margin: "70%"
          },
        ].map((recipe, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  <CardDescription>{recipe.category}</CardDescription>
                </div>
                <Badge variant="secondary">{recipe.margin}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ingredients:</span>
                  <span className="font-medium">{recipe.ingredients} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="font-medium">{recipe.cost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">{recipe.price}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recipe Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Across 6 categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Food Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32%</div>
            <p className="text-xs text-muted-foreground">Target: 28-35%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">64%</div>
            <p className="text-xs text-muted-foreground">Above industry average</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
