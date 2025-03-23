"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, FileText, Target, XCircle } from "lucide-react"

export default function ExamDetail() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center border-b pb-4">
          <CardTitle className="text-2xl font-bold">Exam Detail</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-gray-100 p-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              <span className="text-lg font-semibold">
                Score: <span className="text-orange-500">45/80</span>
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-lg">Time Taken: 45 minutes</span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <FileText className="h-6 w-6" />
              <h2 className="text-xl font-bold">Problem Breakdown</h2>
            </div>

            <div className="space-y-3">
              {/* Problem 1 */}
              <div className="flex items-center">
                <div className="w-1 h-12 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1 flex justify-between items-center">
                  <span className="text-green-600 font-medium">Problem 1</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>5/10 Usecases (10 pts)</span>
                  </div>
                </div>
              </div>

              {/* Problem 2 */}
              <div className="flex items-center">
                <div className="w-1 h-12 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1 flex justify-between items-center">
                  <span className="text-green-600 font-medium">Problem 2</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>8/10 Usecases (15 pts)</span>
                  </div>
                </div>
              </div>

              {/* Problem 3 */}
              <div className="flex items-center">
                <div className="w-1 h-12 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1 flex justify-between items-center">
                  <span className="text-red-600 font-medium">Problem 3</span>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span>Incorrect (0 pts)</span>
                  </div>
                </div>
              </div>

              {/* Problem 4 */}
              <div className="flex items-center">
                <div className="w-1 h-12 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1 flex justify-between items-center">
                  <span className="text-green-600 font-medium">Problem 4</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>10/10 Usecases (20 pts)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 flex justify-center">
            <Button className="px-8">Back</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

