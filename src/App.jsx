import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ProblemList from "./components/pages/problems/ProblemList"
import CreateProblem from "./components/pages/problems/CreateProblem"
import EditProblem from "./components/pages/problems/EditProblem"


function App() {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<ProblemList />} />
          <Route path="/create" element={<CreateProblem />} />
          <Route path="/edit/:id" element={<EditProblem />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

