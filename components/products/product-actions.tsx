// "use client"

// import { Button } from "@/components/ui/button";
// import { useStore } from "@/store/store";
// import { Product } from "@/types/product";
// import { Minus, Plus, ShoppingCart, Trash } from "lucide-react";

// export default function ProductActions({ product }: { product: Product }) {

//     const incQty = useStore.use.incQty();
//     const decQty = useStore.use.decQty();
//     const addProduct = useStore.use.addProduct();
//     const removeProduct =  useStore.use.removeProduct();
//     const products = useStore((state) => state.products);
//     const productQnt = products.find((p) => p.id === product.id)?.quantity;


//   return (
//       <div className="flex items-center justify-center gap-4 ">
//           <Button
//               variant="default"
//               size="lg"
//               className="px-4  min-[460px]:px-8"
//               onClick={() => product.id !== undefined && decQty(product.id, product)}
//               disabled={!productQnt}
//           >
//               <Minus className="h-4 w-4" />
//           </Button>
//           <span>
//               {productQnt ? (
//                   <Button
//                       variant="destructive"
//                       size="lg"
//                       className="px-4 min-[460px]:px-8"
//                       onClick={() => product.id !== undefined && removeProduct(product.id)}
//                   >
//                       <Trash className="mr-4" />
//                       Remove from cart
//                   </Button>
//               ) : (
//                   <Button
//                       onClick={() => addProduct(product)}
//                       variant="default"
//                       size="lg"
//                       className="sm:max-w-fit"
//                   >
//                       <ShoppingCart className="mr-4" />
//                       Add to cart
//                   </Button>
//               )}
//           </span>
//           <Button
//               variant="default"
//               size="lg"
//               className="px-4 relative  min-[460px]:px-8"
//               onClick={() => product.id !== undefined && incQty(product.id, product)}
//           >
//               {productQnt && (
//                   <span className="absolute right-0 top-0 -mr-1 -mt-2 flex h-5 w-5 items-center justify-center rounded-full  bg-red-500 text-xs text-white">
//                       {productQnt}
//                   </span>
//               )}
//               <Plus className="h-4 w-4" />
//           </Button>
//       </div>
//   );
// }
