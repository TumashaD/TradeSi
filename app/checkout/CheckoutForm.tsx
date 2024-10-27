"use client";

import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"; // Adjust this import based on your file structure
import Link from "next/link"; // Import the Link component
import { GetCard, makeOrder } from "@/lib/services";



// Define the validation schema
const formSchema = z.object({
  First_Name: z.string().min(1, { message: "First name is required." }),
  Last_Name: z.string().min(1, { message: "Last name is required." }),
  Email: z.string().email({ message: "Invalid email address." }),
  Telephone: z.string().min(10, { message: "Telephone number is required." }),
  House_No: z.string().min(1, { message: "House number is required." }),
  Address_Line1: z.string().min(1, { message: "Address line 1 is required." }),
  Address_Line2: z.string().optional(),
  City: z.string().min(1, { message: "City is required." }),
  Zipcode: z.string().min(1, { message: "Zip code is required." }),
  Province: z.string().min(1, { message: "Province is required." }),
  Delivery_Method: z.enum(["Store Pickup", "Delivery"]),
  Payment_Type: z.enum(["Cash on Delivery", "Card"]),
  Card_Number: z.string().optional(),
  Expiry_Date: z.string().optional(),
  Name_On_Card: z.string().optional(),
  CVV: z.string().optional(),
});

// Define the props type
interface CheckoutFormProps {
  products: any[]; // Replace 'any' with your product type if needed
  totalPrice: number;
  customer: any; // Replace 'any' with your customer type if needed
}

export function CheckoutForm({ products, totalPrice, customer }: CheckoutFormProps) {
  const router = useRouter();
  const [showCVV, setShowCVV] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // State for the alert dialog
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(0);
  const [noStockFlag, setNoStockFlag] = useState(false);
  const [noStockMessage, setNoStockMessage] = useState("");
  const [card, setCard] = useState<any | null>(null);
  
  

  // Fetch card details when the component mounts or customer changes
  useEffect(() => {
    const fetchCard = async () => {
      try {
        const cardDetails = await GetCard(customer.Customer_ID);
        // Assuming you want to use the first card if there are multiple
        setCard(cardDetails[0] || null); 
      } catch (error) {
        console.error("Failed to fetch card details:", error);
      }
    };

    if (customer?.Customer_ID) {
      fetchCard();
    }
  }, [customer]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      First_Name: customer?.First_Name || "",
      Last_Name: customer?.Last_Name || "",
      Email: customer?.Email || "",
      Telephone: customer?.Telephone || "",
      House_No: customer?.House_No || "",
      Address_Line1: customer?.Address_Line1 || "",
      Address_Line2: customer?.Address_Line2 || "",
      City: customer?.City || "",
      Zipcode: customer?.Zipcode || "",
      Province: "",
      Delivery_Method: "Delivery",
      Payment_Type: "Cash on Delivery",
      Card_Number: card?.Card_Number || "",
      Expiry_Date: card?.Expiry_Date || "",
      Name_On_Card: card?.Name_On_Card || "",
      CVV: "",
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        First_Name: customer?.First_Name || "",
        Last_Name: customer?.Last_Name || "",
        Email: customer?.Email || "",
        Telephone: customer?.Telephone || "",
        House_No: customer?.House_No || "",
        Address_Line1: customer?.Address_Line1 || "",
        Address_Line2: customer?.Address_Line2 || "",
        City: customer?.City || "",
        Zipcode: customer?.Zipcode || "",
        Province: "",
        Delivery_Method: "Delivery",
        Payment_Type: "Cash on Delivery",
        Card_Number: card?.Card_Number || "",
        Expiry_Date: card?.Expiry_Date || "",
        Name_On_Card: card?.Name_On_Card || "",
        CVV: "",
      });
    }
  }, [customer, form]);

  // Check stock and set delivery time
  useEffect(() => {
    let deliveryTime = 0;
    let outOfStockItems: any[] = [];
    const deliveryMethod = form.watch("Delivery_Method");
    const city = form.watch("City");

    if (deliveryMethod === "Delivery") {
      deliveryTime = city === "Colombo" ? 5 : 7;
    }

    // Check for stock status
    products.forEach((item) => {
      if (item.Stock === 0) {
        setNoStockFlag(true);
        outOfStockItems.push(item.Title);
      }
    });

    // Set estimated delivery time
    if (noStockFlag) {
      deliveryTime += 3; // Add 3 days for out-of-stock items
      setNoStockMessage(`Reason for delay: ${outOfStockItems.join(", ")} currently out of stock`);
    } else {
      setNoStockFlag(false);
      setNoStockMessage("");
    }

    setEstimatedDeliveryTime(deliveryTime);
  }, [products, form.watch("Delivery_Method"), form.watch("City")]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);

    // Open the alert dialog on successful submission
    setOpenDialog(true);
  };

  return (
    <Form {...form}>
      <div className="border p-8 rounded-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6">
          {/* Basic Info */}
          <FormField
            control={form.control}
            name="First_Name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your first name" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Last_Name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your last name" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Address Fields */}
          <FormField
            control={form.control}
            name="Telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telephone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your telephone number" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="House_No"
            render={({ field }) => (
              <FormItem>
                <FormLabel>House No</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your house number" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Address_Line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your address line 1" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Address_Line2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2 (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your address line 2" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="City"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your city" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Zipcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your zip code" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your province" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Delivery Method */}
          <FormField
            control={form.control}
            name="Delivery_Method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Method</FormLabel>
                <FormControl>
                  <select {...field} className="border rounded-md p-2 ml-2">
                    <option value="Delivery">Delivery</option>
                    <option value="Store Pickup">Store Pickup</option>
                  </select>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Payment Type */}
          <FormField
            control={form.control}
            name="Payment_Type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Type</FormLabel>
                <FormControl>
                  <select {...field} className="block w-full p-2 border border-gray-300 rounded-md">
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Card">Card</option>
                  </select>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Card Fields (conditional rendering based on Payment_Type) */}
          {form.watch("Payment_Type") === "Card" && (
            <>
              <FormField
                control={form.control}
                name="Card_Number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your card number" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Expiry_Date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Name_On_Card"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name on Card</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name on card" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="CVV"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="CVV"
                          type={showCVV ? "text" : "password"}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCVV(!showCVV)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showCVV ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </>
          )}

          <Button type="submit" className="mt-4">
            Proceed to Checkout
          </Button>
        </form>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
      <AlertDialogTrigger asChild>
        <Button className="hidden">Open Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
          <AlertDialogDescription>
            {noStockFlag && (
              <>
                <p>{noStockMessage}</p>
              </>
            )}
            <p>Estimated delivery time: {estimatedDeliveryTime} days</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
          <Button
            onClick={async () => {
              console.log("Confirm Order button clicked!"); // Check if this runs

              // Gather the form data
              const values = form.getValues();

              // Ensure paymentType is correctly typed
              const paymentType = values.Payment_Type === "Card" ? 'Card' : 'Cash On Delivery' as 'Card' | 'Cash On Delivery'; // Type assertion

              const formData = {
                paymentType,
                deliveryType: values.Delivery_Method as string, // Adjust if needed
                houseNo: values.House_No,
                addressLine1: values.Address_Line1,
                addressLine2: values.Address_Line2,
                city: values.City,
                province: values.Province,
                zipcode: values.Zipcode,
              };

              try {
                // Call the makeOrder function
                await makeOrder(products, totalPrice, { Customer_ID: customer.Customer_ID }, formData);
                toast.success("Order confirmed!"); // Show success message
                
                // Redirect to home page after a short delay to allow the toast to be seen
                setTimeout(() => {
                  router.push('/'); // Redirect to home page
                }, 2000); // Adjust the delay as needed (2000 ms = 2 seconds)

                setOpenDialog(false); // Close the dialog
              } catch (error) {
                console.error("Error making order:", error);
                toast.error("Failed to confirm order."); // Show error message
              }
            }}
          >
            Confirm Order
          </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </Form>
  );
}