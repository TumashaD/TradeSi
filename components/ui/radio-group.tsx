// components/ui/radio-group.tsx

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils"; // If you have a utility for handling class names

interface RadioGroupProps extends RadioGroupPrimitive.RadioGroupProps {}

export const RadioGroup = ({ className, ...props }: RadioGroupProps) => (
  <RadioGroupPrimitive.Root className={cn("space-y-2", className)} {...props} />
);

interface RadioGroupItemProps extends RadioGroupPrimitive.RadioGroupItemProps {}

export const RadioGroupItem = ({ className, ...props }: RadioGroupItemProps) => (
  <RadioGroupPrimitive.Item
    className={cn(
      "bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center",
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="bg-blue-600 w-3 h-3 rounded-full" />
  </RadioGroupPrimitive.Item>
);