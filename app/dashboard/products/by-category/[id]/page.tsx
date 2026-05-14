"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  slug: string;
  permalink: string;
  stock_status: string;
  in_stock: boolean;
}

interface ProductDetails {
  id: number;
  name: string;
  price: string;
  description: string;
  image: string;
  gallery: string[];
  stock_status: string;
  in_stock: boolean;
}

export default function CategoryProductsPage() {
      const params = useParams();
       const router = useRouter();
      
      const categoryId = params?.id;
  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  /* ================= FETCH CATEGORY PRODUCTS ================= */

  const fetchProducts = async () => {
    try {
      const res = await API.get(
        `/admin/products/categories/${categoryId}`
      );

      console.log("products:", res.data);

      setProducts(res.data);
    } catch (err) {
      console.error(
        "Failed to fetch products:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    fetchProducts();
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
    <div className=" ">
      {/* ================= PRODUCTS ================= */}

      <div>
        
        <div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <Button
      variant="outline"
      size="icon"
      onClick={() => router.back()}
      className="h-10 w-10 rounded-full border-muted-foreground/20 cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>

    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Category Products
      </h1>

      <p className="text-sm  mt-1">
        View and manage products in this category
      </p>
    </div>
  </div>
</div>

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() =>
                  router.push(`/dashboard/products/${product.id}`)
                }
                className="border rounded-xl overflow-hidden shadow-sm bg-white cursor-pointer hover:shadow-lg transition"
              >
                {/* IMAGE */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-52 object-cover"
                />

                {/* CONTENT */}
                <div className="p-4 space-y-2">
                  <h2 className="font-semibold text-lg line-clamp-2">
                    {product.name}
                  </h2>

                  <p className="text-xl font-bold text-primary">
                    ${product.price}
                  </p>

                  <p
                    className={`text-sm font-medium ${
                      product.in_stock
                        ? "text-primary"
                        : "text-red-500"
                    }`}
                  >
                    {product.in_stock
                      ? "In Stock"
                      : "Out of Stock"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
    </div>
  );
}