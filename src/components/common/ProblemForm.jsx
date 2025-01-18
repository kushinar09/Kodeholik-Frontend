import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createProblem, updateProblem } from "@/lib/api"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"

function ProblemForm({ problem }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: problem?.title || "",
    description: problem?.description || "",
    difficulty: problem?.difficulty || "EASY",
    status: problem?.status || "PRIVATE"
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (problem) {
      await updateProblem(problem.id, formData)
    } else {
      await createProblem(formData)
    }
    navigate("/")
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title"
        required
      />
      <Textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        required
      />
      <Select
        name="difficulty"
        value={formData.difficulty}
        onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="EASY">Easy</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HARD">Hard</SelectItem>
        </SelectContent>
      </Select>
      <Select
        name="status"
        value={formData.status}
        onValueChange={(value) => setFormData({ ...formData, status: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PUBLIC">Public</SelectItem>
          <SelectItem value="PRIVATE">Private</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">{problem ? "Update" : "Create"} Problem</Button>
    </form>
  )
}

export default ProblemForm

