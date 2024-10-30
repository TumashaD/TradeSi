'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Product, Attribute, Variant, Category } from "@/types/product"
import { addProduct, getAllCategories ,getAllAttributeTypes} from '@/lib/services/products'
import toast from 'react-hot-toast'


export default function AddProductPage() {
  const [product, setProduct] = useState<Product>({
    title: '',
    description: '',
    basePrice: 0,
    imageUrl: '',
    category: 0,
    attributes: [],
    variants: []
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [attributeTypes, setAttributeTypes] = useState<Attribute[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const categories = await getAllCategories()
      const attributeTypes = await getAllAttributeTypes()
      console.log(attributeTypes)
      setAttributeTypes(attributeTypes)
      setCategories(categories)
    }
    fetchData()
  }, [])

  const addProductAttribute = () => {
    setProduct(prev => ({
      ...prev,
      attributes: [...prev.attributes, { type_id: '', name: '' }]
    }))
  }

  const removeProductAttribute = (index: number) => {
    setProduct(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }))
  }

  const addVariant = () => {
    setProduct(prev => ({
      ...prev,
      variants: [...prev.variants, { sku: '', quantity: 0, imageUrl: '', priceIncrement: 0, attributes: [] }]
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

  const addVariantAttribute = (variantIndex: number) => {
    setProduct(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === variantIndex ? { ...v, attributes: [...v.attributes, { type_id: '', name: '' }] } : v
      )
    }))
  }

  const handleCategoryChange = (value: string) => {
      const category = parseInt(value, 10);
      setProduct((prev) => ({ ...prev, category }));
  };

  const updateProductAttribute = (index: number, field: keyof Attribute, value: string) => {
    setProduct(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }))
  }

  const updateVariantAttribute = (variantIndex: number, attrIndex: number, field: keyof Attribute, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting product:', product)
    const result = await addProduct(product)
    if (result) {
      toast('Product added successfully!')
    }
    else {
      toast.error('Failed to add product')
    }
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
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={handleCategoryChange}>
              <SelectTrigger>
              <SelectValue placeholder="Select a category">
                {categories.find((cat) => cat.Category_ID === product.category)?.Name}
              </SelectValue>
              </SelectTrigger>
              <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                {category.Name}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Product Attributes</Label>
            {product.attributes.map((attr, index) => (
              <div key={index} className="flex space-x-2">
                {/* Select for attribute type */}
                <Select onValueChange={(value) => updateProductAttribute(index, 'type_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type">
                      {attributeTypes.find((type) => type.type_id === attr.type_id)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {attributeTypes.map((type) => (
                      <SelectItem key={type.type_id} value={type.type_id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input 
                  placeholder="Name"
                  value={attr.name} 
                  onChange={(e) => updateProductAttribute(index, 'name', e.target.value)}
                  required
                />
                <Button 
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeProductAttribute(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addProductAttribute}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Product Attribute
            </Button>
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
                  <Label htmlFor={`priceIncrement-${variantIndex}`}>Price Increment</Label>
                  <Input 
                    id={`priceIncrement-${variantIndex}`}
                    type="number"
                    value={variant.priceIncrement} 
                    onChange={(e) => updateVariant(variantIndex, 'priceIncrement', parseFloat(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Variant Attributes</Label>
                  {variant.attributes.map((attr, attrIndex) => (
                    <div key={attrIndex} className="flex space-x-2">
                      {/* Select for attribute type */}
                      <Select onValueChange={(value) => updateVariantAttribute(variantIndex, attrIndex, 'type_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type">
                            {attributeTypes.find((type) => type.type_id === attr.type_id)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {attributeTypes.map((type) => (
                            <SelectItem key={type.type_id} value={type.type_id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input 
                        placeholder="Name"
                        value={attr.name} 
                        onChange={(e) => updateVariantAttribute(variantIndex, attrIndex, 'name', e.target.value)}
                        required
                      />
                     {/* Remove The Attribute */}
                      <Button 
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => setProduct(prev => ({
                          ...prev,
                          variants: prev.variants.map((v, i) => 
                            i === variantIndex ? { 
                              ...v, 
                              attributes: v.attributes.filter((_, j) => j !== attrIndex)
                            } : v
                          )
                        }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => addVariantAttribute(variantIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Variant Attribute
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