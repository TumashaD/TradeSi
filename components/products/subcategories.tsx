// import { useEffect, useState } from "react";
// import clsx from "clsx";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { getSubCategories } from "@/lib/services/products";

// type SubCategoryButtonProps = {
//     link: string;
//     category: string;
//     currentCategory: string;
// };

// export default function SubCategoryButton({
//     link,
//     category,
//     currentCategory,
// }: SubCategoryButtonProps) {
//     const [isHovered, setIsHovered] = useState(false);
//     const [subCategories, setSubCategories] = useState<string[]>([]);

//     useEffect(() => {
//         async function fetchSubCategories() {
//             const data = await getSubCategories(category);
//             setSubCategories(data);
//         }
//         fetchSubCategories();
//     }, [category]);

//     return (
//         <div
//             className="relative inline-block"
//             onMouseEnter={() => setIsHovered(true)}
//             onMouseLeave={() => setIsHovered(false)}
//         >
//             <Button
//                 variant={"link"}
//                 className={clsx(
//                     "h-9 p-0 underline-offset-4 hover:underline dark:hover:text-neutral-100",
//                     {
//                         "underline underline-offset-4": currentCategory === category,
//                     }
//                 )}
//             >
//                 <Link href={link} className="p-4">
//                     {category}
//                 </Link>
//             </Button>

//             {isHovered && subCategories.length > 0 && (
//                 <ul className="absolute left-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg">
//                     {subCategories.map((subCategory) => (
//                         <li key={subCategory} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700">
//                             <Link href={`/products?category=${subCategory}`}>{subCategory}</Link>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// }
