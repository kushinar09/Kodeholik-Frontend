"use client"

import { useState, useContext, createContext } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = createContext({})

export const Accordion = ({ children, className, type = "single", collapsible = false, ...props }) => {
  const [openItems, setOpenItems] = useState({})

  const toggleItem = (value) => {
    if (type === "single") {
      setOpenItems((prev) => ({
        [value]: collapsible ? !prev[value] : true,
      }))
    } else {
      setOpenItems((prev) => ({
        ...prev,
        [value]: !prev[value],
      }))
    }
  }

  const contextValue = {
    openItems,
    toggleItem,
  }

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        className={cn("divide-y divide-border-muted rounded-md border border-border-muted", className)}
        data-type={type}
        data-collapsible={collapsible}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export const AccordionItem = ({ value, className, children, ...props }) => {
  const { openItems } = useContext(AccordionContext)
  return (
    <div
      className={cn("overflow-hidden", className)}
      data-value={value}
      data-state={openItems?.[value] ? "open" : "closed"}
      {...props}
    >
      {children}
    </div>
  )
}

export const AccordionTrigger = ({ children, className, ...props }) => {
  const { toggleItem } = useContext(AccordionContext)
  const value = props["data-value"] || props.value

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between px-4 py-4 text-left text-text-primary hover:bg-bg-muted transition-colors group",
        className,
      )}
      {...props}
    >
      {typeof children === "string" ? <span className="font-medium">{children}</span> : children}
      <ChevronDown className="h-5 w-5 text-text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </button>
  )
}

export const AccordionContent = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
        className,
      )}
      {...props}
    >
      <div className="p-4">{children}</div>
    </div>
  )
}

