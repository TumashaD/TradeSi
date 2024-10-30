'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, Loader2, PlusCircle, Save } from 'lucide-react'
import { addCard, getCardDetails, updateCard } from "@/lib/services/customer"; // Ensure these functions are exported correctly
import { CardDetail } from "@/types/card";

export default function CardManager({ customerId }: { customerId: number }) {
  const [cardDetails, setCardDetails] = useState<CardDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCardDetails = async () => {
      setIsLoading(true)
      try {
        const details = await getCardDetails(customerId);
        setCardDetails(details);
      } catch (error) {
        console.error('Error fetching card details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch card details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCardDetails();
  }, [customerId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => {
        if (prev) {
            // If prev is defined, spread its properties and update the specified field
            return { ...prev, [name]: value } as CardDetail; // Type assertion
        } else {
            // If prev is null, create a new CardDetail object with default values
            return {
                cardId: 0, // Default or an appropriate initial value
                customerId: customerId, // Use the customer ID passed in props
                cardNumber: BigInt(0), // Initialize to a default bigint value
                nameOnCard: '',
                expiryDate: '',
                constructor: { name: "RowDataPacket" }, // Adjust according to your actual structure
            } as CardDetail; // Type assertion
        }
    });
  }

  const formatExpiryDate = (expiry: string): string => {
    const [month, year] = expiry.split('/');
    const fullYear = `20${year}`; // Convert YY to YYYY (make sure this is valid for your case)
    return `${fullYear}-${month}-01`; // Format to 'YYYY-MM-DD'
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Validate card details before proceeding
        if (!cardDetails || !cardDetails.cardNumber || !cardDetails.nameOnCard || !cardDetails.expiryDate) {
            throw new Error("Please fill out all card details.");
        }

        const formattedExpiryDate = formatExpiryDate(cardDetails.expiryDate);
            if (isAddingCard) {
                // Call addCard with the necessary parameters
                const { success, message } = await addCard(
                    customerId,
                    BigInt(cardDetails?.cardNumber || 0), // Convert card number to bigint
                    cardDetails?.nameOnCard || '', // Get the name on card
                    formattedExpiryDate // Use the formatted expiry date
                );
    
                if (!success) {
                    throw new Error(message);
                }
            } else if (cardDetails) {
                const formattedExpiryDate = formatExpiryDate(cardDetails.expiryDate); // Format expiry date as 'YYYY-MM-DD'
                // Update the existing card using the updateCard function
                const { success, message } = await updateCard(
                    cardDetails.cardId, // Assuming cardDetails has a cardId property
                    customerId,
                    BigInt(cardDetails.cardNumber), // Convert card number to bigint
                    cardDetails.nameOnCard,
                    formattedExpiryDate // Format expiry date correctly
                );
    
                if (!success) {
                    throw new Error(message);
                }
            }
    
            toast({
                title: "Success",
                description: isAddingCard ? "Your card has been successfully added." : "Your card information has been successfully updated.",
            });
        } catch (error) {
            console.error('Error updating card details:', error);
            toast({
                title: "Error",
                description: "Failed to update card details. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
            setIsAddingCard(false);
        }
    };

  return (
    <Card className="w-full max-w-md p-4"> {/* Adjusted container for sizing */}
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold flex items-center space-x-2">
          <CreditCard className="h-8 w-8" />
          <span>Card Management</span>
        </CardTitle>
        <CardDescription>
          Manage your saved card
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!cardDetails && !isAddingCard ? (
              <motion.div
                key="no-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <CreditCard className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-semibold mb-2">No Cards Saved</h2>
                <p className="text-muted-foreground mb-6">You haven't added a card yet. Add one now to get started!</p>
                <Button onClick={() => setIsAddingCard(true)} size="lg" className="w-full max-w-sm">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Card
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="card-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {cardDetails && (
                  <Button
                    variant="ghost"
                    onClick={() => setIsAddingCard(false)}
                    className="mb-4"
                  >
                    {/* <ArrowLeft className="mr-2 h-4 w-4" /> Back to Card List */}
                  </Button>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={cardDetails?.cardNumber ? cardDetails.cardNumber.toString() : ''} // Convert bigint to string for input
                        onChange={handleInputChange}
                        required
                        maxLength={19}
                        pattern="\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}"
                        title="Please enter a valid 16-digit card number"
                        placeholder="1234 5678 9012 3456"
                        className="font-mono text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameOnCard">Name on Card</Label>
                      <Input
                        id="nameOnCard"
                        name="nameOnCard"
                        value={cardDetails?.nameOnCard || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="text-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      value={cardDetails?.expiryDate || ''}
                      onChange={handleInputChange}
                      required
                      placeholder="MM/YY"
                      pattern="\d{2}/\d{2}"
                      title="Please enter a valid expiry date in MM/YY format"
                      className="font-mono text-lg w-full max-w-[200px]"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        {isAddingCard ? 'Add Card' : 'Update Card Details'}
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}