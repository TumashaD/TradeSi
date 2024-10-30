// import { ProductForm } from "@/components/admin/product-form";

// const ProductPage = async () => {

//     return (
//         <div className="flex-col">
//             <div className="flex-1 space-y-4 p-8 pt-6">
//                 <ProductForm />
//             </div>
//         </div>
//     );
// };

// export default ProductPage;

'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Attribute = {
  type: string
  name: string
}

type Variant = {
  sku: string
  quantity: number
  imageUrl: string
  attributes: Attribute[]
}

type Product = {
  title: string
  description: string
  basePrice: number
  imageUrl: string
  variants: Variant[]
}

export default function AddProductPage() {
  const [product, setProduct] = useState<Product>({
    title: '',
    description: '',
    basePrice: 0,
    imageUrl: '',
    variants: []
  })

  const addVariant = () => {
    setProduct(prev => ({
      ...prev,
      variants: [...prev.variants, { sku: '', quantity: 0, imageUrl: '', attributes: [] }]
    }))
  }

  const removeVariant = (index: number) => {
    setProduct(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    setProduct(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }))
  }

  const addAttribute = (variantIndex: number) => {
    setProduct(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === variantIndex ? { ...v, attributes: [...v.attributes, { type: '', name: '' }] } : v
      )
    }))
  }

  const updateAttribute = (variantIndex: number, attrIndex: number, field: keyof Attribute, value: string) => {
    setProduct(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === variantIndex ? {
          ...v,
          attributes: v.attributes.map((attr, j) => 
            j === attrIndex ? { ...attr, [field]: value } : attr
          )
        } : v
      )
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting product:', product)
    // Here you would typically send the data to your backend
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input 
              id="title" 
              value={product.title} 
              onChange={(e) => setProduct(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={product.description} 
              onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base Price</Label>
            <Input 
              id="basePrice" 
              type="number" 
              value={product.basePrice} 
              onChange={(e) => setProduct(prev => ({ ...prev, basePrice: parseFloat(e.target.value) }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input 
              id="imageUrl" 
              value={product.imageUrl} 
              onChange={(e) => setProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {product.variants.map((variant, variantIndex) => (
            <Card key={variantIndex}>
              <CardContent className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold">Variant {variantIndex + 1}</h4>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => removeVariant(variantIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`sku-${variantIndex}`}>SKU</Label>
                  <Input 
                    id={`sku-${variantIndex}`}
                    value={variant.sku} 
                    onChange={(e) => updateVariant(variantIndex, 'sku', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`quantity-${variantIndex}`}>Quantity</Label>
                  <Input 
                    id={`quantity-${variantIndex}`}
                    type="number" 
                    value={variant.quantity} 
                    onChange={(e) => updateVariant(variantIndex, 'quantity', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`imageUrl-${variantIndex}`}>Image URL</Label>
                  <Input 
                    id={`imageUrl-${variantIndex}`}
                    value={variant.imageUrl} 
                    onChange={(e) => updateVariant(variantIndex, 'imageUrl', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Attributes</Label>
                  {variant.attributes.map((attr, attrIndex) => (
                    <div key={attrIndex} className="flex space-x-2">
                      <Input 
                        placeholder="Type"
                        value={attr.type} 
                        onChange={(e) => updateAttribute(variantIndex, attrIndex, 'type', e.target.value)}
                        required
                      />
                      <Input 
                        placeholder="Name"
                        value={attr.name} 
                        onChange={(e) => updateAttribute(variantIndex, attrIndex, 'name', e.target.value)}
                        required
                      />
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => addAttribute(variantIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Attribute
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" onClick={addVariant}>
            <Plus className="h-4 w-4 mr-2" /> Add Variant
          </Button>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">Add Product</Button>
    </form>
  )
}
