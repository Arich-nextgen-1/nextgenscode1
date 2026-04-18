"use client"

import { useEffect, useState } from "react"
import { timeAgo } from "@/lib/utils"

interface FormattedDateProps {
  date: string | Date
  type?: "date" | "time" | "datetime" | "relative"
  options?: Intl.DateTimeFormatOptions
  className?: string
}

export function FormattedDate({ 
  date, 
  type = "datetime", 
  options, 
  className 
}: FormattedDateProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className={className}>...</span>
  }

  const dateObj = typeof date === "string" ? new Date(date) : date
  
  let formatted = ""
  
  if (type === "relative") {
    formatted = timeAgo(date)
  } else {
    const defaultOptions: Intl.DateTimeFormatOptions = options || (
      type === "time" 
        ? { hour: "2-digit", minute: "2-digit" }
        : type === "date"
          ? { day: "2-digit", month: "long" }
          : { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }
    )

    if (type === "time") {
      formatted = dateObj.toLocaleTimeString("ru-RU", defaultOptions)
    } else if (type === "date") {
      formatted = dateObj.toLocaleDateString("ru-RU", defaultOptions)
    } else {
      formatted = dateObj.toLocaleString("ru-RU", defaultOptions)
    }
  }

  return <span className={className}>{formatted}</span>
}
