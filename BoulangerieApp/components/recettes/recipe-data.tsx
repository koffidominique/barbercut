export type Ingredient = {
    id: string;
    name: string;
    unit: string;
    stockQty: number;
    alertThreshold: number;
    unitPrice: number;
};

export type RecipeIngredient = {
    ingredientId: string;
    quantityPerBatch: number;
    batchYield: number;
};

export type Recipe = {
    id: string;
    productName: string;
    salePrice: number;
    ingredients: RecipeIngredient[];
    bakeTemp: string;
    bakeTime: string;
};

export const INGREDIENTS: Ingredient[] = [
    { id: "farine", name: "Farine de blé", unit: "kg", stockQty: 120, alertThreshold: 25, unitPrice: 650 },
    { id: "levure", name: "Levure", unit: "kg", stockQty: 4, alertThreshold: 2, unitPrice: 3500 },
    { id: "sel", name: "Sel", unit: "kg", stockQty: 15, alertThreshold: 3, unitPrice: 400 },
    { id: "sucre", name: "Sucre", unit: "kg", stockQty: 40, alertThreshold: 10, unitPrice: 800 },
    { id: "beurre", name: "Beurre", unit: "kg", stockQty: 18, alertThreshold: 5, unitPrice: 4500 },
    { id: "eau", name: "Eau", unit: "L", stockQty: 500, alertThreshold: 50, unitPrice: 0 },
    { id: "lait", name: "Lait", unit: "L", stockQty: 30, alertThreshold: 8, unitPrice: 1200 },
    { id: "oeufs", name: "Œufs", unit: "pièce", stockQty: 240, alertThreshold: 60, unitPrice: 100 },
];

export const RECIPES: Recipe[] = [
    {
        id: "baguette",
        productName: "Baguette classique",
        salePrice: 300,
        bakeTemp: "240°C",
        bakeTime: "20 min",
        ingredients: [
            { ingredientId: "farine", quantityPerBatch: 25, batchYield: 100 },
            { ingredientId: "eau", quantityPerBatch: 15, batchYield: 100 },
            { ingredientId: "sel", quantityPerBatch: 0.5, batchYield: 100 },
            { ingredientId: "levure", quantityPerBatch: 0.5, batchYield: 100 },
        ],
    },
    {
        id: "brioche",
        productName: "Brioche",
        salePrice: 1500,
        bakeTemp: "180°C",
        bakeTime: "25 min",
        ingredients: [
            { ingredientId: "farine", quantityPerBatch: 10, batchYield: 40 },
            { ingredientId: "beurre", quantityPerBatch: 4, batchYield: 40 },
            { ingredientId: "sucre", quantityPerBatch: 2, batchYield: 40 },
            { ingredientId: "oeufs", quantityPerBatch: 30, batchYield: 40 },
            { ingredientId: "lait", quantityPerBatch: 3, batchYield: 40 },
            { ingredientId: "levure", quantityPerBatch: 0.3, batchYield: 40 },
        ],
    },
    {
        id: "croissant",
        productName: "Croissant",
        salePrice: 800,
        bakeTemp: "200°C",
        bakeTime: "18 min",
        ingredients: [
            { ingredientId: "farine", quantityPerBatch: 8, batchYield: 50 },
            { ingredientId: "beurre", quantityPerBatch: 3, batchYield: 50 },
            { ingredientId: "sucre", quantityPerBatch: 1, batchYield: 50 },
            { ingredientId: "lait", quantityPerBatch: 2, batchYield: 50 },
            { ingredientId: "levure", quantityPerBatch: 0.2, batchYield: 50 },
            { ingredientId: "sel", quantityPerBatch: 0.15, batchYield: 50 },
        ],
    },
];

export function formatFCFA(value: number) {
    return `${Math.round(value).toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
}

export function ingredientById(id: string): Ingredient {
    const found = INGREDIENTS.find((i) => i.id === id);
    if (!found) throw new Error(`Ingrédient inconnu : ${id}`);
    return found;
}

export function costPerUnit(recipe: Recipe): number {
    const batch = recipe.ingredients[0]?.batchYield ?? 1;
    const batchCost = recipe.ingredients.reduce((sum, ri) => {
        return sum + ri.quantityPerBatch * ingredientById(ri.ingredientId).unitPrice;
    }, 0);
    return batchCost / batch;
}

export function marginPerUnit(recipe: Recipe): number {
    return recipe.salePrice - costPerUnit(recipe);
}
