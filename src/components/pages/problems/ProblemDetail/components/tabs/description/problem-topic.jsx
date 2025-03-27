"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export default function TopicSection({ topics }) {
  const [isTopicOpen, setIsTopicOpen] = useState(false)
  return (
    <div className="w-full mx-auto space-y-6">
      <div onClick={() => setIsTopicOpen(!isTopicOpen)} className="flex items-center justify-between cursor-pointer">
        <div className="flex items-center">
          <div className="mr-2">
            <svg className="h-5 w-5 text-black" aria-hidden="true" focusable="false" data-prefix="far" data-icon="tag" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M197.5 32c17 0 33.3 6.7 45.3 18.7l176 176c25 25 25 65.5 0 90.5L285.3 450.7c-25 25-65.5 25-90.5 0l-176-176C6.7 262.7 0 246.5 0 229.5V80C0 53.5 21.5 32 48 32H197.5zM48 229.5c0 4.2 1.7 8.3 4.7 11.3l176 176c6.2 6.2 16.4 6.2 22.6 0L384.8 283.3c6.2-6.2 6.2-16.4 0-22.6l-176-176c-3-3-7.1-4.7-11.3-4.7H48V229.5zM112 112a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></path></svg>
          </div>
          <div>
            <h2 className="text-md font-semibold flex items-center gap-2">
                Topics ({topics.length})
            </h2>
          </div>
        </div>
        {topics.length > 0 &&
                    <Button variant="ghost" size="sm">
                      {!isTopicOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>}
      </div>
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isTopicOpen ? 1 : 0, height: isTopicOpen ? "auto" : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="flex flex-row flex-wrap">
            {topics.map((topic) => (
              <Badge key={topic} variant="outline" className="bg-gray-300 py-1.5 mb-4 text-black mr-2">{topic}</Badge>
            ))}
          </div>

        </motion.div>
      </div>

    </div>
  )
}