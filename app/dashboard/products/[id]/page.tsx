"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { useParams, useRouter } from "next/navigation";

import {
  Loader2,
  ArrowLeft,
  Package,
  ImageIcon,
  Info,
  Pencil,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
// import { Separator } from from "@/components/ui/separator";

import UpdateProductModal from "../../../../components/product/UpdateProductModal";

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

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params?.id;

  const [product, setProduct] =
    useState<ProductDetails | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const fetchProductDetails =
    async () => {
      setLoading(true);

      try {
        const res =
          await API.get(
            `/admin/products/${productId}`
          );

        setProduct(res.data);
      } catch (err) {
        console.error(
          "Failed to fetch product details:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Package className="h-12 w-12 text-muted-foreground" />

        <p className="text-xl font-medium text-muted-foreground">
          Product not found
        </p>

        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
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
              Product Details
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              View and manage product information
            </p>
          </div>
        </div>

        {/* EDIT BUTTON */}
        {/* <UpdateProductModal
          open={editOpen}
          onOpenChange={setEditOpen}
          product={product}
          onSuccess={fetchProductDetails}
        >
          <Button className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Product
          </Button>
        </UpdateProductModal> */}
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-7 space-y-6">
          <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
            <img
              src={
                product.image ||
                "/placeholder.png"
              }
              alt={product.name}
              className="w-full aspect-square object-cover transition-all duration-500 hover:scale-105"
            />
          </div>

          {product.gallery?.length >
            0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {product.gallery.map(
                (img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-md border overflow-hidden bg-muted"
                  >
                    <img
                      src={img}
                      alt={`gallery-${i}`}
                      className="h-full w-full object-cover hover:opacity-80 transition cursor-pointer"
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-6">
            {/* PRODUCT INFO */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge
                  variant={
                    product.in_stock
                      ? "secondary"
                      : "destructive"
                  }
                  className="rounded-full"
                >
                  {product.in_stock
                    ? "● In Stock"
                    : "Out of Stock"}
                </Badge>

                <span className="text-xs text-muted-foreground font-mono">
                  ID: #{product.id}
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {product.name}
              </h1>

              <p className="text-3xl font-semibold mt-4 text-primary">
                ${product.price}
              </p>
            </div>

            {/* <Separator /> */}

            {/* TABS */}
            <Tabs
              defaultValue="description"
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="description"
                  className="gap-2"
                >
                  <Info className="h-4 w-4" />
                  Description
                </TabsTrigger>

                <TabsTrigger
                  value="details"
                  className="gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Specs
                </TabsTrigger>
              </TabsList>

              <Card className="mt-4 border-none shadow-none bg-transparent">
                {/* DESCRIPTION */}
                <TabsContent
                  value="description"
                  className="mt-0"
                >
                  <div className="w-full overflow-hidden rounded-xl">
                    <div
                      className="prose max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{
                        __html:
                          product.description ||
                          "<p>No description available.</p>",
                      }}
                    />
                  </div>
                </TabsContent>

                {/* DETAILS */}
                <TabsContent
                  value="details"
                  className="mt-0"
                >
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">
                        Availability
                      </span>

                      <span className="font-medium">
                        {product.stock_status ||
                          "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">
                        Product ID
                      </span>

                      <span className="font-medium">
                        #{product.id}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">
                        Price
                      </span>

                      <span className="font-medium">
                        ${product.price}
                      </span>
                    </div>
                  </div>
                </TabsContent>
              </Card>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}