import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ViewCoursePage from "./components/pages/courses/ViewCoursePage"
import ViewCourseDetail from "./components/pages/courses/ViewCourseDetail"
import ProblemList from "./components/pages/problems/ProblemList"
import CreateProblem from "./components/pages/problems/CreateProblem"
import EditProblem from "./components/pages/problems/EditProblem"
import MarkdownEditor from "./components/common/markdown/MarkdownEditor"
import CodeEditor from "./components/common/editor-code/CodeEditor"
import ProblemPage from "./components/pages/problems/ProblemPage"
import HomePage from "./components/pages/HomePage"
import Login from "./components/pages/authentications/login"
import ForgotPassword from "./components/pages/authentications/Forgot"
import ResetPassword from "./components/pages/authentications/reset"
import { Toaster } from "./components/ui/toaster"
import ProblemDetail from "./components/pages/problems/ProblemDetail/ProblemDetail"
import { AuthProvider } from "./context/AuthProvider"


function App() {
  return (
    <>

      <Router>
        <AuthProvider>
          <div className="mx-auto">
            <Routes>
              <Route path="/" element={<ProblemPage />} />
              <Route path="/problems" element={<ProblemPage />} />
              <Route path="/problem/:id" element={<ProblemDetail />} />
              <Route path="/create" element={<CreateProblem />} />
              <Route path="/edit/:id" element={<EditProblem />} />
              <Route path="/markdown" element={<MarkdownEditor />} />
              <Route path="/template" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot" element={<ForgotPassword />} />
              <Route path="/reset" element={<ResetPassword />} />
              <Route path="/courses" element={<ViewCoursePage />} />
              <Route path="/courses/:id" element={<ViewCourseDetail />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
      <Toaster />

    </>
  )
}

export default App

