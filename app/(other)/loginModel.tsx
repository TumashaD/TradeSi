'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'

export default function DialogPop() {
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()

  const handleLogin = () => {
    console.log('Login clicked')
    router.push('/login')
    setIsOpen(false)
  }

  const handleGuest = () => {
    console.log('Continue as guest clicked')
    router.push('/')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>
            Please choose how you'd like to proceed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
          <Button onClick={handleGuest} variant="outline" className="w-full">
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}