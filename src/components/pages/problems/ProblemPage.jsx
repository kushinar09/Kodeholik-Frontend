import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import Header from "@/components/common/shared/header"
import { RadialChart } from "@/components/common/radial-chart"
import { Check, CheckCircle, Search, XCircle } from "lucide-react"
import FooterSection from "@/components/common/shared/footer"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function ProblemPage() {
  const stats = {
    mainLabel: "Solve",
    mainCount: 140,
    mainTotal: 3406,
    mainColor: "#98ff99",
    sideStats: [
      {
        label: "Easy",
        count: 40,
        total: 846,
        color: "rgb(74, 222, 128)"
      },
      {
        label: "Medium",
        count: 40,
        total: 1775,
        color: "rgb(234, 179, 8)"
      },
      {
        label: "Hard",
        count: 20,
        total: 785,
        color: "rgb(239, 68, 68)"
      },
      {
        label: "OkVip",
        count: 40,
        total: 785,
        color: "rgb(151, 43, 165)"
      }
    ],
    className: ""
  }

  const topics = [
    "Arrays",
    "Strings",
    "Hash Table",
    "Dynamic Programming",
    "Math",
    "Sorting",
    "Greedy",
    "Depth-First Search",
    "Binary Search",
    "Database",
    "Binary Tree",
    "Stack"
  ]

  const skills = [
    "Problem Solving",
    "Data Structures",
    "Algorithms",
    "Time Complexity",
    "Space Complexity",
    "System Design"
  ]

  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [difficulty, setDifficulty] = useState("all")
  const [search, setSearch] = useState("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(true)

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]))
  }

  const removeTopic = (topic) => {
    setSelectedTopics((prev) => prev.filter((t) => t !== topic))
  }

  return (
    <>
      <div className="min-h-screen bg-bg-primary">
        <Header/>
        {/* Main Content */}
        <main className="p-4 px-24">
          {/* Study Plan Section */}
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
                <Card className="p-4 bg-bg-card border-0 aspect-video rounded-xl">
                  <RadialChart {...stats} />
                </Card>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Content */}
            <div className="col-span-2 space-y-6">
              {/* Problem Section */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Let&apos;s Solve a Problem</h2>
                <div className="relative group mb-4">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-input-border w-5 h-5 transition-colors group-focus-within:text-primary transition" />
                  <Input
                    className="pl-12 h-12 text-lg text-input-text bg-input-bg/50 border-input-border rounded-xl transition focus:border-input-borderFocus"
                    placeholder="Search problems..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="bg-bg-card rounded-lg p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-primary-text text-sm">
                        <th className="text-left py-2">#</th>
                        <th className="text-left py-2">Title</th>
                        <th className="text-left py-2">Acceptance</th>
                        <th className="text-left py-2">Difficulty</th>
                        <th className="text-left py-2">Participant</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-white cursor-pointer hover:bg-gray-800 gap-10">
                        <td className="py-2" title="Solved">
                          <Check className="w-5 h-5 text-green-500"/>
                          {/* <XCircle className="w-5 h-5 text-red-500"/> */}
                        </td>
                        <td className="py-2 truncate pe-4 max-w-24">Two Sum</td>
                        <td className="py-2">45%</td>
                        <td className="py-2 text-green-500">Easy</td>
                        <td className="py-2">1.2M</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Calendar */}
              {/* <Card className="p-4 bg-primary-card border-0">
                <Calendar mode="single" className="text-white" />
              </Card> */}

              {/* Progress Chart */}

            </div>
          </div>
        </main>
        <FooterSection />
      </div>
    </>
  )
}

