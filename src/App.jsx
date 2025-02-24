import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ViewCoursePage from "./components/pages/courses/ViewCoursePage"
import ViewCourseDetail from "./components/pages/courses/ViewCourseDetail"
import Learn from "./components/pages/courses/LearnThroughVideoAndText"
import ProblemList from "./components/pages/problems/ProblemList"
import CreateProblem from "./components/pages/problems/CreateProblem"
import EditProblem from "./components/pages/problems/EditProblem"
import MarkdownEditor from "./components/common/markdown/MarkdownEditor"
import CodeEditor from "./components/common/editor-code/CodeEditor"
import ProblemPage from "./components/pages/problems/ProblemPage"
import HomePage from "./components/pages/HomePage"



function App() {
  return (
    <Router>
      <div className="mx-auto">
        <Routes>
          <Route path="/" element={<ProblemPage />} />
          <Route path="/problems" element={<ProblemPage />} />
          <Route path="/create" element={<CreateProblem />} />
          <Route path="/edit/:id" element={<EditProblem />} />
          <Route path="/markdown" element={<MarkdownEditor />} />
          <Route path="/template" element={<HomePage />} />
          <Route path="/courses" element={<ViewCoursePage />} />
          <Route path="/courses/:id" element={<ViewCourseDetail />} />
          <Route path="/learn" element={<Learn />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

