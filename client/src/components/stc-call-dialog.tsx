"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { PhoneCall } from "lucide-react"

interface StcCallDialogProps {
  open: boolean
  onComplete: () => void
}

export function StcCallDialog({ open, onComplete }: StcCallDialogProps) {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!open) {
      setCountdown(10)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, onComplete])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md" 
        dir="rtl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">STC Call Dialog</DialogTitle>
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          {/* Animated Phone Icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <div className="w-24 h-24 rounded-full bg-green-400 opacity-75"></div>
            </div>
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-green-500">
              <PhoneCall className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              مكالمة واردة من STC
            </h2>
            <p className="text-base text-gray-600 leading-relaxed px-4">
              عملينا STC سيتم التواصل معك للتأكيد رقم جوالك
              <br />
              <span className="font-semibold text-green-600">اضغط رقم 5</span>
            </p>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 border-4 border-green-500">
              <span className="text-3xl font-bold text-green-600">{countdown}</span>
            </div>
            <p className="text-sm text-gray-500">ثانية</p>
          </div>

          {/* Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
            <p className="text-sm text-green-900 text-center">
              📞 تأكد من الرد على المكالمة لإتمام عملية التحقق
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
