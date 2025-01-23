import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ProblemList from "./components/pages/problems/ProblemList"
import CreateProblem from "./components/pages/problems/CreateProblem"
import EditProblem from "./components/pages/problems/EditProblem"
import MarkdownEditor from "./components/common/markdown/MarkdownEditor"
import CodeEditor from "./components/common/editor-code/CodeEditor"


function App() {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<CodeEditor />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/create" element={<CreateProblem />} />
          <Route path="/edit/:id" element={<EditProblem />} />
          <Route path="/markdown" element={<MarkdownEditor />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

