"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";
import { Product } from "@/types/product";
import Image from "next/image";
import {
    ArrowLeft,
    Minus,
    Plus,
    ShoppingCart,
    Star,
    StarHalf,
} from "lucide-react";

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "title",
        header: "Name",
        size: 250,
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
            <div className="flex items-center gap-x-2">
                <span className="text-lg font-semibold">
                    ${row.original.base_price}
                </span>
            </div>
        ),
        size: 200,
    },
    {
        accessorKey: "description",
        cell: (info) => info.getValue(),
        header: "Description",
        size: 600,
    },
    {
        accessorKey: "category",
        header: "Category",
        size: 200,
    },
    {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => (
            <div className="flex items-center gap-x-2">
                <img
                    src={row.original.imageURL}
                    alt={row.original.title}
                    width={150}
                    height={150}
                    className="max-w-[240px] rounded-2xl bg-white object-contain p-8 sm:max-w-[350px]"
                />
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];
