"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Mock product data
const productData = {
  name: "SuperTech Pro Laptop",
  basePrice: 999,
  description: "Experience unparalleled performance with the SuperTech Pro Laptop. Designed for professionals and power users, this laptop combines cutting-edge technology with sleek design.",
  weight: "1.8 kg",
  colors: ["Silver", "Space Gray", "Gold"],
  storage: ["256GB", "512GB", "1TB"],
  ram: ["8GB", "16GB", "32GB"],
  variants: [
    { color: "Silver", storage: "256GB", ram: "8GB", price: 999, stock: 10 },
    { color: "Silver", storage: "512GB", ram: "16GB", price: 1299, stock: 5 },
    { color: "Space Gray", storage: "512GB", ram: "16GB", price: 1299, stock: 8 },
    { color: "Gold", storage: "1TB", ram: "32GB", price: 1799, stock: 0 },
  ]
}

// Mock similar products data
const similarProducts = [
  { id: 1, name: "UltraBook Slim", price: 899, image: "/placeholder.svg?height=200&width=200" },
  { id: 2, name: "PowerPro Laptop", price: 1199, image: "/placeholder.svg?height=200&width=200" },
  { id: 3, name: "TechMaster Notebook", price: 1099, image: "/placeholder.svg?height=200&width=200" },
  { id: 4, name: "Elite Book Pro", price: 1399, image: "/placeholder.svg?height=200&width=200" },
  { id: 5, name: "Innovator Laptop", price: 1299, image: "/placeholder.svg?height=200&width=200" },
]

// Mock API call
const fetchProductVariant = (color: string, storage: string, ram: string) => {
  return new Promise<{ price: number; stock: number }>((resolve) => {
    setTimeout(() => {
      const variant = productData.variants.find(
        v => v.color === color && v.storage === storage && v.ram === ram
      )
      resolve(variant ? { price: variant.price, stock: variant.stock } : { price: 0, stock: 0 })
    }, 300) // Simulate network delay
  })
}

export default function ProductPage() {
  const [color, setColor] = useState(productData.colors[0])
  const [storage, setStorage] = useState(productData.storage[0])
  const [ram, setRam] = useState(productData.ram[0])
  const [price, setPrice] = useState(productData.basePrice)
  const [stock, setStock] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const updatePriceAndStock = async () => {
      setLoading(true)
      const { price, stock } = await fetchProductVariant(color, storage, ram)
      setPrice(price)
      setStock(stock)
      setLoading(false)
    }
    updatePriceAndStock()
  }, [color, storage, ram])

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${quantity} ${productData.name} added to your cart.`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <img
            src="/placeholder.svg?height=400&width=400"
            alt={productData.name}
            className="w-full h-auto rounded-lg shadow-lg"
          />
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p>{productData.description}</p>
            <p className="mt-2"><strong>Weight:</strong> {productData.weight}</p>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{productData.name}</h1>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-semibold">${price.toFixed(2)}</p>
          )}
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Color</h2>
            <RadioGroup value={color} onValueChange={setColor} className="flex space-x-2">
              {productData.colors.map((c) => (
                <div key={c} className="flex items-center space-x-2">
                  <RadioGroupItem value={c} id={`color-${c}`} />
                  <Label
                    htmlFor={`color-${c}`}
                    className={cn(
                      "px-3 py-1 rounded-full cursor-pointer transition-colors",
                      color === c ? "bg-primary text-primary-foreground" : "bg-secondary"
                    )}
                  >
                    {c}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Storage</h2>
            <Select value={storage} onValueChange={setStorage}>
              <SelectTrigger>
                <SelectValue placeholder="Select storage" />
              </SelectTrigger>
              <SelectContent>
                {productData.storage.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">RAM</h2>
            <Select value={ram} onValueChange={setRam}>
              <SelectTrigger>
                <SelectValue placeholder="Select RAM" />
              </SelectTrigger>
              <SelectContent>
                {productData.ram.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Quantity</h2>
            <Input
              type="number"
              min="1"
              max={stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, stock))}
              className="w-20"
            />
          </div>

          <div className="text-sm">
            {loading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className={stock > 0 ? "text-green-600" : "text-red-600"}>
                {stock > 0 ? `In stock: ${stock} available` : "Out of stock"}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={loading || stock === 0}
            className="w-full"
          >
            {loading ? (
              <Skeleton className="h-5 w-24" />
            ) : stock === 0 ? (
              "Out of Stock"
            ) : (
              "Add to Cart"
            )}
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Similar Products</h2>
        <div className="relative">
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
            {similarProducts.map((product) => (
              <div key={product.id} className="flex-none w-64">
                <div className="border rounded-lg p-4 h-full flex flex-col">
                  <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-4 rounded" />
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">${product.price}</p>
                  <Button variant="outline" className="mt-auto">View Product</Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-background/80"
            onClick={() => {
              const container = document.querySelector('.overflow-x-auto');
              container?.scrollBy({ left: -200, behavior: 'smooth' });
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-background/80"
            onClick={() => {
              const container = document.querySelector('.overflow-x-auto');
              container?.scrollBy({ left: 200, behavior: 'smooth' });
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}