"use client"

import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Calendar } from "./calendar"

export function CourseHeader() {
  const [date, setDate] = useState(new Date())
  return (
    <section className="mb-4">
      <h2 className="text-xl font-semibold text-white mb-4">Study Plan</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-32 bg-bg-card border-0" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Card className="p-4 bg-primary-card border-0">
            <Calendar date={date} setDate={setDate} />
          </Card>
        </div>
      </div>
    </section>
  )
}

