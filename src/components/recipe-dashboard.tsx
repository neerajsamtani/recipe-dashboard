import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, X } from 'lucide-react';
import recipes from '@/data/recipes.json';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

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
    instructions: string[];
}

interface RecipeWithMatch extends Recipe {
    missingCount: number;
    matchedCount: number;
    totalCount: number;
    score: number;
    missingIngredients: string[];
}

export const RecipeDashboard = () => {
    const [currentInput, setCurrentInput] = useState('');
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithMatch | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentInput.trim()) {
            e.preventDefault();
            setIngredients([...ingredients, currentInput.trim().toLowerCase()]);
            setCurrentInput('');
        }
    };

    const removeIngredient = (ingredientToRemove: string) => {
        setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
    };

    const calculateScore = (matched: number, total: number): number => {
        return matched / total;
        // Alternative scoring function
        // const missing = total - matched;
        // return matched / (total + Math.exp(missing));
    };

    const getRecipeMatches = (): RecipeWithMatch[] => {
        return recipes.map(recipe => {
            const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
            const missingIngredients = recipeIngredients.filter(recipeIngredient => {
                // Check if any user ingredient matches completely within recipe ingredient words
                return !ingredients.some(userIngredient => {
                    const userWords = userIngredient.toLowerCase().split(' ');

                    // All user words must be found as complete words in the recipe
                    return userWords.every(userWord => {
                        // Add word boundary check using regex
                        const wordRegex = new RegExp(`\\b${userWord}\\b`);
                        return recipeIngredient.match(wordRegex);
                    });
                });
            });

            const totalCount = recipeIngredients.length;
            const missingCount = missingIngredients.length;
            const matchedCount = totalCount - missingCount;

            return {
                ...recipe,
                missingCount,
                matchedCount,
                totalCount,
                score: calculateScore(matchedCount, totalCount),
                missingIngredients
            };
        }).sort((a, b) => b.score - a.score);
    };

    const matchedRecipes = getRecipeMatches();

    const clearAllIngredients = () => {
        setIngredients([]);
    };

    const handleRecipeClick = (recipe: RecipeWithMatch) => {
        setSelectedRecipe(recipe);
    };

    return (
        <div className={`w-full max-w-4xl mx-auto ${!ingredients.length ? 'fixed inset-0 flex items-center justify-center' : 'space-y-6'}`}>
            <Card className={`${!ingredients.length ? 'w-full max-w-4xl mx-6' : 'mt-6'}`}>
                <CardHeader>
                    <CardTitle>Recipe Match Finder</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Type an ingredient and press Enter"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1"
                        />
                    </div>

                    {ingredients.length > 0 && (
                        <div className="flex justify-between items-center">
                            <div className="flex flex-wrap gap-2">
                                {ingredients.map((ingredient, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="px-3 py-1 cursor-pointer hover:bg-secondary/80 flex items-center gap-1"
                                        onClick={() => removeIngredient(ingredient)}
                                    >
                                        {ingredient}
                                        <X className="w-3 h-3" />
                                    </Badge>
                                ))}
                            </div>
                            <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-secondary"
                                onClick={clearAllIngredients}
                            >
                                Clear All
                            </Badge>
                        </div>
                    )}
                </CardContent>
            </Card>

            {ingredients.length > 0 && (
                <div className="space-y-6">
                    {matchedRecipes.slice(0, 10).map((recipe) => (
                        <Card
                            key={recipe.name}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => handleRecipeClick(recipe)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle>{recipe.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {recipe.servings} servings | {recipe.calories} calories
                                        </p>
                                    </div>
                                    <div className="text-right space-y-2">
                                        <Badge variant={recipe.missingCount === 0 ? "default" : "secondary"}>
                                            Score: {recipe.score.toFixed(3)}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground">
                                            {recipe.matchedCount}/{recipe.totalCount} ingredients matched
                                        </p>
                                    </div>
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
            )}
            {selectedRecipe && (
                <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <DialogHeader className="p-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <DialogTitle>{selectedRecipe.name}</DialogTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedRecipe.servings} servings | {selectedRecipe.calories} calories
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right space-y-2">
                                        <Badge variant={selectedRecipe.missingCount === 0 ? "default" : "secondary"}>
                                            Score: {selectedRecipe.score.toFixed(3)}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedRecipe.matchedCount}/{selectedRecipe.totalCount} ingredients matched
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Protein</p>
                                        <p className="text-2xl font-bold">{selectedRecipe.protein.amount}{selectedRecipe.protein.unit}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Carbs</p>
                                        <p className="text-2xl font-bold">{selectedRecipe.carbs.amount}{selectedRecipe.carbs.unit}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Fat</p>
                                        <p className="text-2xl font-bold">{selectedRecipe.fat.amount}{selectedRecipe.fat.unit}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-4">Ingredients</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedRecipe.ingredients.map((ingredient, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg border ${selectedRecipe.missingIngredients.includes(ingredient.name.toLowerCase())
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

                            <div>
                                <h4 className="text-sm font-medium mb-4">Instructions</h4>
                                <ol className="list-decimal list-inside space-y-2">
                                    {selectedRecipe.instructions.map((instruction, idx) => (
                                        <li key={idx} className="text-sm">
                                            {instruction}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};