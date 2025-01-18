import { getProblemList } from "@/lib/api"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import DeleteProblem from "./DeleteProblem"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { globalState } from "@/constants"


function ProblemList() {
  useEffect(() => {
    document.title = `Problems - ${globalState.WebsiteName}`
  }, [])

  const [problems, setProblems] = useState([])

  useEffect(() => {
    const fetchProblems = async () => {
      const data = await getProblemList()
      setProblems(data)
    }
    fetchProblems()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Problems</h1>
      <Link to="/create">
        <Button className="mb-4">Create New Problem</Button>
      </Link>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((problem) => (
            <TableRow key={problem.id}>
              <TableCell>{problem.id}</TableCell>
              <TableCell>{problem.title}</TableCell>
              <TableCell>{problem.difficulty}</TableCell>
              <TableCell>{problem.status}</TableCell>
              <TableCell>
                <Link to={`/edit/${problem.id}`}>
                  <Button variant="outline" className="mr-2">Edit</Button>
                </Link>
                <DeleteProblem id={problem.id} onDelete={() => {
                  setProblems(problems.filter(p => p.id !== problem.id))
                }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ProblemList

