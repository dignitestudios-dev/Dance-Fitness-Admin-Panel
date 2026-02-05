"use client"
import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { Loader2, Eye, Trash2, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: number;
  title: string;
  description: string;
  amount: string;
  discount: string;
  stock: number;
  image: string;
  created_at: string;
}

interface PaginatedProducts {
  current_page: number;
  data: Product[];
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [pagination, setPagination] = useState<PaginatedProducts>({
    current_page: 1,
    data: [],
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
  });

  // View details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [category, setCategory] = useState("");

  // Add product modal
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Add product form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const categories = [
    "Tools for designers",
    "Tools for teachers",
    "Guides and training plans",
    "Team and group training",
    "Virtual trainings and recordings",
  ];

  const fetchProducts = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/admin/products", { params: { page } });
      setProducts(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        data: res.data.data,
        last_page: res.data.last_page,
        next_page_url: res.data.next_page_url,
        prev_page_url: res.data.prev_page_url,
      });
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (id: number) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setSelectedProduct(null);
    try {
      const res = await API.get(`/admin/products/${id}`);
      setSelectedProduct(res.data);
    } catch (err) {
      console.error("Failed to fetch product details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await API.delete(`/admin/products/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Image is required");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", parseInt(price).toString());
      formData.append("discount_per", parseInt(discount).toString()); // Typo corrected
      formData.append("stock", parseInt(stock).toString());
      formData.append("image", imageFile);
      formData.append("category", category);

      await API.post("/admin/add-product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAddOpen(false);
      window.location.reload();

      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setDiscount("");
      setStock("");
      setImageFile(null);

      // Refresh list
      fetchProducts(pagination.current_page);
    } catch (err) {
      console.error("Failed to add product:", err);
      alert("Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              <Input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
              
              {/* Category Dropdown */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="" disabled>Select Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <Input placeholder="Discount %" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              <Input placeholder="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} required />

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <img src={`https://dancer-fitness-bucket.s3.us-east-2.amazonaws.com/${p.image}`} alt={p.title} className="w-full h-40 object-contain" />
            </CardHeader>

            <CardContent className="space-y-2">
              <h2 className="font-semibold text-sm">{p.title}</h2>
              <p className="text-xs text-muted-foreground line-clamp-3">{p.description}</p>

              <div className="flex items-center justify-between">
                <span className="font-bold">${p.amount}</span>
                {parseFloat(p.discount) > 0 && (
                  <Badge variant="secondary">{p.discount}% off</Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>

              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => fetchProductDetails(p.id)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => { setDeleteId(p.id); setDeleteOpen(true); }}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : selectedProduct && (
            <div className="space-y-4">
              <img src={`https://dancer-fitness-bucket.s3.us-east-2.amazonaws.com/${selectedProduct.image}`}
              className="w-full h-48 object-contain rounded-lg" />
              <h2 className="text-lg font-semibold">{selectedProduct.title}</h2>
              <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><strong>Price:</strong> ${selectedProduct.amount}</div>
                <div><strong>Discount:</strong> {selectedProduct.discount}%</div>
                <div><strong>Stock:</strong> {selectedProduct.stock}</div>
                <div><strong>Created:</strong> {new Date(selectedProduct.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {/* Previous Page */}
          <Button
            size="sm"
            variant="outline"
            disabled={!pagination.prev_page_url}
            onClick={() => fetchProducts(pagination.current_page - 1)}
          >
            &laquo; Previous
          </Button>

          {/* Page Numbers */}
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              variant={page === pagination.current_page ? "default" : "outline"}
              onClick={() => fetchProducts(page)}
            >
              {page}
            </Button>
          ))}

          {/* Next Page */}
          <Button
            size="sm"
            variant="outline"
            disabled={!pagination.next_page_url}
            onClick={() => fetchProducts(pagination.current_page + 1)}
          >
            Next &raquo;
          </Button>
        </div>
      )}
    </div>
  );
}
