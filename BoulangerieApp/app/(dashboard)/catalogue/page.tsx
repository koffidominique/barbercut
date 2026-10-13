"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/reui/badge";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { listUserProducts, getProductVariants, type ProductRecord, type ProductVariant } from "@/lib/sales/catalog";
import { ProductForm } from "@/components/products/ProductForm";

export default function CataloguePage() {
    const [products, setProducts] = useState<ProductRecord[]>([]);
    const [variants, setVariants] = useState<Record<string, ProductVariant[]>>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Charger les produits au chargement de la page
    useEffect(() => {
        async function loadProducts() {
            try {
                const userProducts = await listUserProducts("current-user", true);
                setProducts(userProducts);

                // Charger les variantes pour chaque produit
                const variantsMap: Record<string, ProductVariant[]> = {};
                for (const product of userProducts) {
                    const productVariants = await getProductVariants(product.id);
                    variantsMap[product.id] = productVariants;
                }
                setVariants(variantsMap);
            } catch (error) {
                console.error("Erreur chargement produits:", error);
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    // Filtrer les produits selon la recherche
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.barcode && product.barcode.includes(searchTerm))
    );

    // Ouvrir le formulaire pour créer un nouveau produit
    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsDialogOpen(true);
    };

    // Ouvrir le formulaire pour éditer un produit existant
    const handleEditProduct = (product: ProductRecord) => {
        setSelectedProduct(product);
        setIsDialogOpen(true);
    };

    // Supprimer/désactiver un produit
    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (response.ok) {
                // Recharger les produits après suppression
                const updatedProducts = await listUserProducts("current-user", true);
                setProducts(updatedProducts);
                alert(data.message);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Erreur suppression produit:", error);
            alert("Erreur lors de la suppression du produit");
        }
    };

    // Après sauvegarde d'un produit (création ou mise à jour)
    const handleProductSaved = async () => {
        setIsDialogOpen(false);
        // Recharger la liste des produits
        const updatedProducts = await listUserProducts("current-user", true);
        setProducts(updatedProducts);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Catalogue des produits</h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez vos produits, leurs attributs et variantes
                    </p>
                </div>
                <Button onClick={handleAddProduct}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un produit
                </Button>
            </div>

            {/* Barre de recherche */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom, SKU ou code-barres..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
                </div>
            </div>

            {/* Tableau des produits */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Prix de vente</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Variantes</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                    Aucun produit trouvé. Commencez par ajouter votre premier produit !
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.sku || "-"}</TableCell>
                                    <TableCell>
                                        {product.category ? (
                                            <Badge variant="secondary">{product.category}</Badge>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell>{product.salePrice.toLocaleString()} FCFA</TableCell>
                                    <TableCell>{product.currentStock}</TableCell>
                                    <TableCell>
                                        {variants[product.id]?.length > 0 ? (
                                            <Badge>{variants[product.id].length} variante{variants[product.id].length > 1 ? "s" : ""}</Badge>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={product.active ? "success" : "destructive"}>
                                            {product.active ? "Actif" : "Inactif"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditProduct(product)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteProduct(product.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialogue pour ajouter/éditer un produit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedProduct ? "Modifier le produit" : "Ajouter un nouveau produit"}
                        </DialogTitle>
                    </DialogHeader>
                    <ProductForm
                        product={selectedProduct}
                        onSave={handleProductSaved}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}