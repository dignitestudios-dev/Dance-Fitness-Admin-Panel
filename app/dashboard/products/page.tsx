"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { Loader2, Eye, Trash2, Plus, Pencil } from "lucide-react";
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
  category: string;
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

  const [pagination, setPagination] = useState<PaginatedProducts>({
    current_page: 1,
    data: [],
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
  });

  // View
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add / Edit
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const categories = [
    "Tools for designers",
    "Tools for teachers",
    "Guides and training plans",
    "Team and group training",
    "Virtual trainings and recordings",
  ];

  /* ---------------- FETCH PRODUCTS ---------------- */
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VIEW DETAILS ---------------- */
  const fetchProductDetails = async (id: number) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const res = await API.get(`/admin/products/${id}`);
      setSelectedProduct(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDeleteProduct = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await API.delete(`/admin/products/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    } catch {
      alert("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------- ADD / EDIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", parseInt(price, 10).toString()); // ✅ FIX
    formData.append("stock", parseInt(stock, 10).toString()); // ✅ FIX
    formData.append("category", category);
    formData.append("discount_per", "0"); // ✅ required by backend


    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (isEditing && editId) {
      await API.post(`/admin/products/${editId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await API.post("/admin/add-product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    setFormOpen(false);
    resetForm();
    fetchProducts(pagination.current_page);
  } catch (err) {
    alert("Failed to save product");
  } finally {
    setSubmitting(false);
  }
};


  const resetForm = () => {
    setEditId(null);
    setIsEditing(false);
    setTitle("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategory("");
    setImageFile(null);
  };

  const openEdit = (p: Product) => {
    setIsEditing(true);
    setEditId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setPrice(p.amount);
    setStock(p.stock.toString());
    setCategory(p.category);
    setFormOpen(true);
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

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
              <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price" required />
              <Input value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="Stock" required />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="" disabled>Select Category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <Card key={p.id}>
            <CardHeader className="p-0">
              <img
                src={`https://dancer-fitness-bucket.s3.us-east-2.amazonaws.com/${p.image}`}
                className="w-full h-40 object-contain"
              />
            </CardHeader>

            <CardContent className="space-y-2">
              <h2 className="font-semibold text-sm truncate">{p.title}</h2>
              <p className="text-xs text-muted-foreground line-clamp-3">{p.description}</p>
              <div className="flex justify-between">
                <span className="font-bold">${p.amount}</span>
                {/* <Badge>{p.category}</Badge> */}
              </div>
              <p className="text-xs">Stock: {p.stock}</p>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => fetchProductDetails(p.id)}>
                  <Eye className="h-4 w-4 " /> 
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" /> 
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { setDeleteId(p.id); setDeleteOpen(true); }}>
                  <Trash2 className="h-4 w-4 " /> 
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p>Are you sure?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          {detailsLoading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : selectedProduct && (
            <div className="space-y-3">
              <img
                src={`https://dancer-fitness-bucket.s3.us-east-2.amazonaws.com/${selectedProduct.image}`}
                className="w-full h-48 object-contain"
              />
              <h2 className="font-bold">{selectedProduct.title}</h2>
              <p>{selectedProduct.description}</p>
                            <p>Stock: {selectedProduct.stock}</p>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
