import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import recipes from '@/data/recipes.json';

interface Ingredient {
    name: string;
    quantity: number;
    unit: string;
}

interface Nutrient {
    amount: number;
    unit: string;
}

interface Recipe {
    name: string;
    servings: number;
    calories: number;
    fat: Nutrient;
    carbs: Nutrient;
    protein: Nutrient;
    ingredients: Ingredient[];
}

interface RecipeWithMatch extends Recipe {
    missingCount: number;
    missingIngredients: string[];
}

export const RecipeDashboard = () => {
    const [availableIngredients, setAvailableIngredients] = useState('');

    const getRecipeMatches = (): RecipeWithMatch[] => {
        const ingredients = availableIngredients.toLowerCase().split(',').map(i => i.trim()).filter(i => i);

        return recipes.map(recipe => {
            const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
            const missingIngredients = recipeIngredients.filter(i => !ingredients.some(avail => i.includes(avail)));

            return {
                ...recipe,
                missingCount: missingIngredients.length,
                missingIngredients
            };
        }).sort((a, b) => a.missingCount - b.missingCount);
    };

    const matchedRecipes = getRecipeMatches();

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Recipe Match Finder</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Enter ingredients you have (comma-separated)"
                            value={availableIngredients}
                            onChange={(e) => setAvailableIngredients(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {matchedRecipes.map((recipe) => (
                    <Card key={recipe.name}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <CardTitle>{recipe.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {recipe.servings} servings | {recipe.calories} calories
                                    </p>
                                </div>
                                <Badge variant={recipe.missingCount === 0 ? "default" : "secondary"}>
                                    Missing: {recipe.missingCount} ingredients
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Protein</p>
                                        <p className="text-2xl font-bold">{recipe.protein.amount}{recipe.protein.unit}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Carbs</p>
                                        <p className="text-2xl font-bold">{recipe.carbs.amount}{recipe.carbs.unit}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Fat</p>
                                        <p className="text-2xl font-bold">{recipe.fat.amount}{recipe.fat.unit}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-4">Ingredients</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {recipe.ingredients.map((ingredient, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg border ${recipe.missingIngredients.includes(ingredient.name.toLowerCase())
                                                ? 'bg-destructive/10 border-destructive/20'
                                                : 'bg-secondary border-secondary'
                                                }`}
                                        >
                                            <span className="text-sm">
                                                {ingredient.quantity} {ingredient.unit} {ingredient.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <Separator />
                        <CardFooter className="pt-6">
                            <p className="text-sm text-muted-foreground">
                                Recipe ID: {recipe.name.toLowerCase().replace(/\s+/g, '-')}
                            </p>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};