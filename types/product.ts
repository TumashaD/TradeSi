export type Product = {
    product_id: number;
    title: string;
    description: string;
    base_price: number;
    imageURL: string;
    category: string;
};

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


export interface Rating {
    rate: number;
    count: number;
}
