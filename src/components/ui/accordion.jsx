"use client"

import { useState, useContext, createContext } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = createContext({})

export const Accordion = ({ children, className, type = "single", collapsible = false, value, onValueChange, ...props }) => {
  const [openItems, setOpenItems] = useState(value ? { [value]: true } : {})

  const toggleItem = (itemValue) => {
    if (type === "single") {
      const newState = openItems[itemValue] && collapsible ? {} : { [itemValue]: true }
      setOpenItems(newState)
      if (onValueChange) {
        onValueChange(Object.keys(newState)[0] || "")
      }
    } else {
      setOpenItems((prev) => {
        const newState = { ...prev, [itemValue]: !prev[itemValue] }
        if (onValueChange) {
          onValueChange(Object.keys(newState).filter((key) => newState[key]))
        }
        return newState
      })
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
      data-state={openItems[value] ? "open" : "closed"}
      {...props}
    >
      {children}
    </div>
  )
}

export const AccordionTrigger = ({ children, className, value, onClick, ...props }) => {
  const { toggleItem, openItems } = useContext(AccordionContext)
  const itemValue = value || props["data-value"]

  const handleClick = (e) => {
    toggleItem(itemValue) // Call the internal toggle logic
    if (onClick) onClick(e) // Call any additional onClick handler
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-center justify-between px-4 py-4 text-left text-text-primary hover:bg-bg-muted transition-colors group",
        className,
      )}
      data-value={itemValue}
      data-state={openItems[itemValue] ? "open" : "closed"}
      {...props}
    >
      {typeof children === "string" ? <span className="font-medium">{children}</span> : children}
      <ChevronDown className="h-5 w-5 text-text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </button>
  )
}

export const AccordionContent = ({ children, className, value, ...props }) => {
  const { openItems } = useContext(AccordionContext)
  const itemValue = value || props["data-value"]

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        openItems[itemValue] ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
        className,
      )}
      data-state={openItems[itemValue] ? "open" : "closed"}
      {...props}
    >
      <div className="p-0">{children}</div>
    </div>
  )
}