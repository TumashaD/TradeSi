import { RowDataPacket } from "mysql2";

export type Attribute = {
    type_id: string
    name: string
  }
  
 export  type Variant = {
    sku: string
    quantity: number
    imageUrl: string
    priceIncrement: number
    attributes: Attribute[]
  }
  
  export type Product = {
    id?: number
    title: string
    description: string
    basePrice: number
    imageUrl: string
    category: number
    attributes: Attribute[]
    variants: Variant[]
  }
  
  export type Category = {
    Category_ID: number,
    Name: string,
    Parent_Category_ID?: number | null
    }

export interface ProductData extends RowDataPacket {
    Product_ID: bigint;
    Title: string;
    Base_price: string;
    Description: string;
    item_id: number;
    SKU: string;
    imageURL: string | null;
    price_increment: string;
    quantity: number | null;
    Type_ID: number | null;
    Attribute_ID: number | null;
    value: string | null;
    Attribute_Type_ID: number | null;
    Attribute_Type_Name: string | null;
}

export interface ItemData extends RowDataPacket {
    item_id: number;
    product_id: number;
    SKU: string;
    price_increment: number;
    quantity: number;
    imageURL: string | null;
}

export enum ProductCategory {
    Electronics = "electronics",
    Jewelery = "jewelery",
    MenClothing = "men's clothing",
    WomenClothing = "women's clothing",
}

export interface ProductPageQueryParams {
    searchParams: {
        category?: string;
        query?: string;
    };
}