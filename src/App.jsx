import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./provider/AuthProvider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query" 
import ProblemDetail from "./components/pages/problems/ProblemDetail"
import CreateProblem from "./components/pages/problems/CreateProblem"
import EditProblem from "./components/pages/problems/EditProblem"
import MarkdownEditor from "./components/common/markdown/MarkdownEditor"
import HomePage from "./components/pages/homepage"
import ForgotPassword from "./components/pages/authentications/forgot"
import LoginPage from "./components/pages/authentications/login"
import ResetPassword from "./components/pages/authentications/reset"
import CoursePage from "./components/pages/courses/ViewCoursePage"
import CourseDetail from "./components/pages/courses/ViewCourseDetail"

import LearnThroughVideoAndText from "./components/pages/courses/LearnThroughVideoAndText"
import ProblemPage from "./components/pages/problems/ProblemList"
import ProblemCreator from "./components/pages/problems/ProblemCreate"
import CreateCourse from "./components/pages/courses/CreateCourse"
import UpdateCourse from "./components/pages/courses/UpdateCourse"

// components

// Create problem: Detail: title, difficulty (EASY - MEDIUM - HARD), description, status: PUBLIC - PRIVATE, topics, skills, isActive (bool), languageSupport ("Java", "C")
// Input parameters: funtionSignature, returnType (get from api - have other), language, parameters (list <String inputName, String inputType>)
// Editorial: editorialTitle, editorialTextSolution, editorialSkills, solutionCode (List<String solutionlanguage String solutionCode>)
// Test cases:
// TODO: input test case, if input array -> input size
// template input:
// C, java: note for input


// TODO: exam: no copy, no switch tab, show time clock
function App() {
  const queryClient = new QueryClient()
  return (
    <>
      <QueryClientProvider client={queryClient}>
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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot" element={<ForgotPassword />} />
                <Route path="/reset" element={<ResetPassword />} />
                <Route path="/problem/create" element={<ProblemCreator />} />
                {/* course */}
                <Route path="/courses" element={<CoursePage />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/courses/add" element={<CreateCourse/>}/>
                <Route path="/courses/update/:id" element={<UpdateCourse/>}/>
                <Route path="/learn" element={<LearnThroughVideoAndText />} />
                
              </Routes>
            </div>
          </AuthProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </>
  )
}

export default App

