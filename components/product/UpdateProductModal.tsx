"use client";

import { useEffect, useState } from "react";

import {
  Loader2,
  Pencil,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { API } from "@/lib/api/axios";

import { toast } from "sonner";

interface ProductDetails {
  id: number;
  name: string;
  price: string;
  description: string;
  image: string;
  gallery: string[];
  stock_status: string;
  in_stock: boolean;

  // NEW FIELDS
  title?: string;
  discount_per?: number;
  stock?: number;
}

interface UpdateProductModalProps {
  product: ProductDetails;
  onSuccess: () => void;
}

export default function UpdateProductModal({
  product,
  onSuccess,
}: UpdateProductModalProps) {
  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // FORM STATES
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [discountPer, setDiscountPer] =
    useState("");

  const [stock, setStock] =
    useState("");

  useEffect(() => {
    if (product) {
      setTitle(
        product.title ||
          product.name ||
          ""
      );

      setDescription(
        product.description || ""
      );

      setPrice(
        product.price || ""
      );

      setDiscountPer(
        product.discount_per
          ? String(
              product.discount_per
            )
          : ""
      );

      setStock(
        product.stock
          ? String(product.stock)
          : ""
      );
    }
  }, [product]);

  const handleUpdate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !title ||
      !description ||
      !price
    ) {
      toast.error(
        "Please fill all required fields"
      );

      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        description,
        price,
        discount_per:
          Number(discountPer) || 0,
        stock:
          Number(stock) || 0,
      };

      await API.post(
        `/admin/products/${product.id}`,
        payload
      );

      toast.success(
        "Product updated successfully"
      );

      setOpen(false);

      onSuccess();
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to update product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Edit Product
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Update Product
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleUpdate}
          className="space-y-5 mt-4"
        >
          {/* TITLE */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Product Title
            </label>

            <Input
              placeholder="Enter product title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Description
            </label>

            <Textarea
              rows={6}
              placeholder="Enter product description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />
          </div>

          {/* PRICE + DISCOUNT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Price
              </label>

              <Input
                type="number"
                placeholder="130"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Discount %
              </label>

              <Input
                type="number"
                placeholder="1"
                value={discountPer}
                onChange={(e) =>
                  setDiscountPer(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* STOCK */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Stock Quantity
            </label>

            <Input
              type="number"
              placeholder="40"
              value={stock}
              onChange={(e) =>
                setStock(
                  e.target.value
                )
              }
            />
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Product"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}