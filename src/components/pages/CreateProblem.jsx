import { useEffect } from "react"
import ProblemForm from "../common/ProblemForm"
import { globalState } from "@/constants"


function CreateProblem() {
  useEffect(() => {
    document.title = `Create Problem - ${globalState.WebsiteName}`
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Problem</h1>
      <ProblemForm />
    </div>
  )
}

export default CreateProblem

