"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Package2,
  Plus,
  FolderKanban,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  menu_order: number;
  count: number;

  image?: {
    id: number;
    src: string;
    name: string;
    alt: string;
  };
}

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const router = useRouter();

  /* ================= ADD PRODUCT FORM ================= */

  const [formData, setFormData] = useState({
  name: "",
  regular_price: "",
  stock_quantity: "",
  description: "",
  short_description: "",
  category_id: "",
  image: null as File | null,
});

  /* ================= FETCH CATEGORIES ================= */

  const fetchCategories = async () => {
    try {
      const res = await API.get(
        "/admin/product/categories"
      );

      setCategories(res.data);
    } catch (err) {
      console.error(
        "Failed to fetch categories:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD PRODUCT ================= */

  const handleAddProduct = async () => {
  try {
    setCreating(true);

    const data = new FormData();

    data.append("name", formData.name);
    data.append(
      "regular_price",
      formData.regular_price
    );
    data.append(
      "stock_quantity",
      formData.stock_quantity
    );
    data.append(
      "description",
      formData.description
    );
    data.append(
      "short_description",
      formData.short_description
    );

    data.append(
      "categories[0][id]",
      formData.category_id
    );

    // IMAGE
    if (formData.image) {
      data.append("image", formData.image);
    }

    await API.post(
  "/admin/add-product",
  data,
  {
    headers: {
      "Content-Type":
        "multipart/form-data",
    },
  }
);

// CLOSE MODAL
setOpen(false);

// RESET FORM
setFormData({
  name: "",
  regular_price: "",
  stock_quantity: "",
  description: "",
  short_description: "",
  category_id: "",
  image: null,
});

// SUCCESS TOAST
toast.success("Product added successfully");

    setOpen(false);

    setFormData({
      name: "",
      regular_price: "",
      stock_quantity: "",
      description: "",
      short_description: "",
      category_id: "",
      image: null,
    });

    toast.success("Product added successfully");
  } catch (err) {
    console.error(
      "Failed to add product:",
      err
    );
  } finally {
    setCreating(false);
  }
};

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-[#D32C86]" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Product Categories
          </h1>

          <p className="text-muted-foreground mt-1">
            Manage categories and products
          </p>
        </div>

        {/* ADD PRODUCT MODAL */}

        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#D32C86] hover:bg-[#b62572]">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Add New Product
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              {/* PRODUCT NAME */}

              <div className="space-y-2">
                <Label>
                  Product Name
                </Label>

                <Input
                  placeholder="Testing Product"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* PRICE & STOCK */}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Regular Price
                  </Label>

                  <Input
                    type="number"
                    placeholder="10"
                    value={
                      formData.regular_price
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        regular_price:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Stock Quantity
                  </Label>

                  <Input
                    type="number"
                    placeholder="50"
                    value={
                      formData.stock_quantity
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock_quantity:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* CATEGORY */}

              <div className="space-y-2">
                <Label>Category</Label>

                <select
                  className="w-full h-10 border rounded-md px-3 text-sm bg-background"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_id:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* PRODUCT IMAGE */}

<div className="space-y-2">
  <Label>Product Image</Label>

  <Input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setFormData({
        ...formData,
        image:
          e.target.files?.[0] || null,
      })
    }
  />
</div>

              {/* DESCRIPTION */}

              <div className="space-y-2">
                <Label>
                  Description
                </Label>

                <Textarea
                  rows={5}
                  placeholder="Product description..."
                  value={
                    formData.description
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* SHORT DESCRIPTION */}

              <div className="space-y-2">
                <Label>
                  Short Description
                </Label>

                <Textarea
                  rows={3}
                  placeholder="Short description..."
                  value={
                    formData.short_description
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      short_description:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  onClick={
                    handleAddProduct
                  }
                  disabled={creating}
                  className="bg-[#D32C86] hover:bg-[#b62572]"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* CATEGORY GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            onClick={() =>
              router.push(
                `/dashboard/products/by-category/${category.id}`
              )
            }
            className="group overflow-hidden border cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* IMAGE */}

            <div className="relative h-52 overflow-hidden bg-muted">
              {category.image?.src ? (
                <img
                  src={
                    category.image.src
                  }
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FolderKanban className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              <div className="absolute top-3 right-3">
                <Badge className="bg-black/70 text-white border-none">
                  {category.count} Products
                </Badge>
              </div>
            </div>

            {/* CONTENT */}

            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="font-bold text-xl line-clamp-1">
                  {category.name}
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  {category.slug}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package2 className="h-4 w-4" />
                  {category.count} Items
                </div>

                <Button
                  size="sm"
                  className="bg-[#D32C86] hover:bg-[#b62572]"
                >
                  View Products
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}