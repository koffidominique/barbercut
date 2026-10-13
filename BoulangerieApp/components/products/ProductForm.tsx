"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import type { ProductRecord, ProductVariant } from "@/lib/sales/catalog";

// Catégories de produits disponibles
const PRODUCT_CATEGORIES = [
    "Pains", "Viennoiseries", "Pâtisseries", "Gâteaux", "Tartes",
    "Sandwichs", "Snacks", "Biscuits", "Produits salés", "Boissons",
    "Produits complémentaires", "Produits personnalisés"
];

// Types de variantes disponibles
const VARIANT_TYPES = [
    "size", "weight", "format", "flavor", "topping", "packaging"
];

const VARIANT_TYPE_LABELS: Record<string, string> = {
    size: "Taille",
    weight: "Poids",
    format: "Format",
    flavor: "Saveur",
    topping: "Garniture",
    packaging: "Conditionnement"
};

// Unités de mesure disponibles
const UNITS_OF_MEASURE = [
    "unit", "kg", "g", "l", "ml", "piece", "pack"
];

const UNIT_LABELS: Record<string, string> = {
    unit: "Unité",
    kg: "Kilogramme",
    g: "Gramme",
    l: "Litre",
    ml: "Millilitre",
    piece: "Pièce",
    pack: "Pack"
};

interface ProductFormProps {
    product: ProductRecord | null;
    onSave: (product: ProductRecord) => void;
    onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
    // Initialisation des champs du formulaire avec les valeurs du produit (si édition)
    const [formData, setFormData] = useState({
        name: product?.name || "",
        sku: product?.sku || "",
        barcode: product?.barcode || "",
        category: product?.category || "",
        subcategory: product?.subcategory || "",
        imageUrl: product?.imageUrl || "",
        description: product?.description || "",
        salePrice: product?.salePrice || 0,
        promotionalPrice: product?.promotionalPrice || 0,
        unitCost: product?.unitCost || 0,
        purchasePrice: product?.purchasePrice || 0,
        productionCost: product?.productionCost || 0,
        marginPercent: product?.marginPercent || 0,
        tvaRate: product?.tvaRate || 20,
        unitOfMeasure: product?.unitOfMeasure || "unit",
        weightKg: product?.weightKg || 0,
        dimensions: product?.dimensions || "",
        minStock: product?.minStock || 5,
        maxStock: product?.maxStock || 100,
        currentStock: product?.currentStock || 0,
        primarySupplierId: product?.primarySupplierId || "",
        active: product?.active !== false
    });

    // Gestion des variantes du produit
    const [productVariants, setProductVariants] = useState<Omit<ProductVariant, "id" | "productId" | "userId" | "createdAt" | "updatedAt">[]>(
        product?.variants?.map(v => ({
            name: v.name,
            variantType: v.variantType,
            sku: v.sku,
            barcode: v.barcode,
            priceAdjustment: v.priceAdjustment,
            weightAdjustmentKg: v.weightAdjustmentKg,
            stockAdjustment: v.stockAdjustment,
            active: v.active
        })) || []
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mettre à jour un champ du formulaire
    const updateField = (field: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Ajouter une nouvelle variante
    const addVariant = () => {
        setProductVariants(prev => [...prev, {
            name: "",
            variantType: "size",
            sku: "",
            barcode: "",
            priceAdjustment: 0,
            weightAdjustmentKg: 0,
            stockAdjustment: 0,
            active: true
        }]);
    };

    // Supprimer une variante
    const removeVariant = (index: number) => {
        setProductVariants(prev => prev.filter((_, i) => i !== index));
    };

    // Mettre à jour une variante
    const updateVariant = (index: number, field: string, value: unknown) => {
        setProductVariants(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // Soumettre le formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Préparer les données à envoyer à l'API
            const payload = {
                ...(product?.id ? { id: product.id } : {}),
                ...formData,
                variants: productVariants
            };

            // Choisir entre POST (création) et PUT (mise à jour)
            const method = product?.id ? "PUT" : "POST";
            const response = await fetch("/api/products", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                onSave(data.product);
            } else {
                alert(data.error || "Erreur lors de l'enregistrement");
            }
        } catch (error) {
            console.error("Erreur soumission formulaire:", error);
            alert("Erreur réseau lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Informations générales */}
            <FieldGroup>
                <h3 className="text-lg font-semibold mb-4">Informations générales</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel>Nom du produit *</FieldLabel>
                        <Input
                            value={formData.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            required
                            minLength={1}
                            maxLength={160}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>SKU / Référence</FieldLabel>
                        <Input
                            value={formData.sku}
                            onChange={(e) => updateField("sku", e.target.value)}
                            placeholder="BAG-001"
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Code-barres</FieldLabel>
                        <Input
                            value={formData.barcode}
                            onChange={(e) => updateField("barcode", e.target.value)}
                            placeholder="3012345678901"
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Catégorie</FieldLabel>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => updateField("category", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                {PRODUCT_CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <FieldLabel>Sous-catégorie</FieldLabel>
                        <Input
                            value={formData.subcategory}
                            onChange={(e) => updateField("subcategory", e.target.value)}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>URL de l’image</FieldLabel>
                        <Input
                            value={formData.imageUrl}
                            onChange={(e) => updateField("imageUrl", e.target.value)}
                            placeholder="https://..."
                        />
                    </Field>
                </div>

                <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        rows={3}
                        placeholder="Description détaillée du produit..."
                    />
                </Field>
            </FieldGroup>

            <FieldSeparator />

            {/* Prix et coûts */}
            <FieldGroup>
                <h3 className="text-lg font-semibold mb-4">Prix et coûts</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field>
                        <FieldLabel>Prix de vente (FCFA) *</FieldLabel>
                        <Input
                            type="number"
                            value={formData.salePrice}
                            onChange={(e) => updateField("salePrice", Number(e.target.value))}
                            required
                            min={0}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Prix promotionnel (FCFA)</FieldLabel>
                        <Input
                            type="number"
                            value={formData.promotionalPrice}
                            onChange={(e) => updateField("promotionalPrice", Number(e.target.value))}
                            min={0}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Coût unitaire (FCFA) *</FieldLabel>
                        <Input
                            type="number"
                            value={formData.unitCost}
                            onChange={(e) => updateField("unitCost", Number(e.target.value))}
                            required
                            min={0}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Prix d’achat (FCFA)</FieldLabel>
                        <Input
                            type="number"
                            value={formData.purchasePrice}
                            onChange={(e) => updateField("purchasePrice", Number(e.target.value))}
                            min={0}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Coût de production (FCFA)</FieldLabel>
                        <Input
                            type="number"
                            value={formData.productionCost}
                            onChange={(e) => updateField("productionCost", Number(e.target.value))}
                            min={0}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Marge (%)</FieldLabel>
                        <Input
                            type="number"
                            value={formData.marginPercent}
                            onChange={(e) => updateField("marginPercent", Number(e.target.value))}
                            min={0}
                            max={100}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Taux TVA (%)</FieldLabel>
                        <Input
                            type="number"
                            value={formData.tvaRate}
                            onChange={(e) => updateField("tvaRate", Number(e.target.value))}
                            min={0}
                            max={100}
                        />
                    </Field>
                </div>
            </FieldGroup>

            <FieldSeparator />

            {/* Stock et logistique */}
            <FieldGroup>
                <h3 className="text-lg font-semibold mb-4">Stock et logistique</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field>
                        <FieldLabel>Unité de mesure</FieldLabel>
                        <Select
                            value={formData.unitOfMeasure}
                            onValueChange={(value) => updateField("unitOfMeasure", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une unité" />
                            </SelectTrigger>
                            <SelectContent>
                                {UNITS_OF_MEASURE.map(unit => (
                                    <SelectItem key={unit} value={unit}>{UNIT_LABELS[unit]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <FieldLabel>Poids (kg)</FieldLabel>
                        <Input
                            type="number"
                            step="0.001"
                            value={formData.weightKg}
                            onChange={(e) => updateField("weightKg", Number(e.target.value))}
                            min={0}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Dimensions (L×l×h cm)</FieldLabel>
                        <Input
                            value={formData.dimensions}
                            onChange={(e) => updateField("dimensions", e.target.value)}
                            placeholder="30×20×10"
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Stock actuel</FieldLabel>
                        <Input
                            type="number"
                            value={formData.currentStock}
                            onChange={(e) => updateField("currentStock", Number(e.target.value))}
                            min={0}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Stock minimum</FieldLabel>
                        <Input
                            type="number"
                            value={formData.minStock}
                            onChange={(e) => updateField("minStock", Number(e.target.value))}
                            min={0}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Stock maximum</FieldLabel>
                        <Input
                            type="number"
                            value={formData.maxStock}
                            onChange={(e) => updateField("maxStock", Number(e.target.value))}
                            min={0}
                        />
                    </Field>
                </div>
            </FieldGroup>

            <FieldSeparator />

            {/* Variantes du produit */}
            <FieldGroup>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Variantes du produit</h3>
                    <Button type="button" variant="secondary" onClick={addVariant}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter une variante
                    </Button>
                </div>

                {productVariants.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        Aucune variante. Cliquez sur « Ajouter une variante » pour créer des déclinaisons (taille, saveur, etc.)
                    </p>
                ) : (
                    <div className="space-y-4">
                        {productVariants.map((variant, index) => (
                            <div key={index} className="border rounded-lg p-4 relative">
                                <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="absolute top-4 right-4 text-destructive hover:text-destructive/80"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>

                                <h4 className="font-medium mb-3">Variante #{index + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Field>
                                        <FieldLabel>Nom de la variante</FieldLabel>
                                        <Input
                                            value={variant.name}
                                            onChange={(e) => updateVariant(index, "name", e.target.value)}
                                            placeholder="Grande"
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel>Type de variante</FieldLabel>
                                        <Select
                                            value={variant.variantType}
                                            onValueChange={(value) => updateVariant(index, "variantType", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {VARIANT_TYPES.map(type => (
                                                    <SelectItem key={type} value={type}>{VARIANT_TYPE_LABELS[type]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field>
                                        <FieldLabel>SKU variante</FieldLabel>
                                        <Input
                                            value={variant.sku}
                                            onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel>Ajustement prix (FCFA)</FieldLabel>
                                        <Input
                                            type="number"
                                            value={variant.priceAdjustment}
                                            onChange={(e) => updateVariant(index, "priceAdjustment", Number(e.target.value))}
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel>Ajustement poids (kg)</FieldLabel>
                                        <Input
                                            type="number"
                                            step="0.001"
                                            value={variant.weightAdjustmentKg}
                                            onChange={(e) => updateVariant(index, "weightAdjustmentKg", Number(e.target.value))}
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel>Ajustement stock</FieldLabel>
                                        <Input
                                            type="number"
                                            value={variant.stockAdjustment}
                                            onChange={(e) => updateVariant(index, "stockAdjustment", Number(e.target.value))}
                                        />
                                    </Field>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </FieldGroup>

            <FieldSeparator />

            {/* Statut */}
            <FieldGroup>
                <div className="flex items-center justify-between">
                    <div>
                        <FieldLabel>Produit actif</FieldLabel>
                        <p className="text-sm text-muted-foreground">Désactivez ce produit pour le retirer de la vente</p>
                    </div>
                    <Switch
                        checked={formData.active}
                        onCheckedChange={(checked) => updateField("active", checked)}
                    />
                </div>
            </FieldGroup>

            {/* Boutons d'action */}
            <div className="flex items-center justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Enregistrement..." : (product?.id ? "Mettre à jour" : "Créer le produit")}
                </Button>
            </div>
        </form>
    );
}