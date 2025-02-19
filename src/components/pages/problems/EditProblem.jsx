import { getProblem } from "@/lib/api"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import ProblemForm from "../../common/ProblemForm"
import { GLOBALS } from "@/lib/constants"

function EditProblem() {
  useEffect(() => {
    document.title = `Edit Problem - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  const [problem, setProblem] = useState(null)
  const { id } = useParams()

  useEffect(() => {
    const fetchProblem = async () => {
      const data = await getProblem(id)
      setProblem(data)
    }
    fetchProblem()
  }, [id])

  if (!problem) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Problem</h1>
      <ProblemForm problem={problem} />
    </div>
  )
}

export default EditProblem

