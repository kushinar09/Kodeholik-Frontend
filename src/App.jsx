import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import ProblemDetail from "./components/pages/problems/ProblemDetail"
import MarkdownEditor from "./components/common/markdown/MarkdownEditor"
import ForgotPassword from "./components/pages/authentications/forgot"
import LoginPage from "./components/pages/authentications/login"
import ResetPassword from "./components/pages/authentications/reset"
import CoursePage from "./components/pages/courses/ViewCoursePage"
import CourseDetail from "./components/pages/courses/ViewCourseDetail"
import LearnThroughVideoAndText from "./components/pages/courses/LearnThroughVideoAndText"
import ProblemPage from "./components/pages/problems/ProblemList"
import ProblemCreator from "./components/pages/problems/ProblemCreate"
import { AuthProvider } from "./providers/AuthProvider"
import TakeExam from "./components/pages/exam/take-exam"
import UnauthorisedError from "./components/pages/errors/unauthorized-error"
import ForbiddenError from "./components/pages/errors/forbidden"
import NotFoundError from "./components/pages/errors/not-found-error"
import GeneralError from "./components/pages/errors/general-error"
import MaintenanceError from "./components/pages/errors/maintenance-error"

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
                {/* exam */}
                <Route path="/exam/:id/wait" element={<TakeExam />} />
                <Route path="/exam" element={<TakeExam />} />
                <Route path="/exam/:id/" element={<TakeExam />} />

                {/* problem */}
                <Route path="/" element={<ProblemPage />} />
                <Route path="/problems" element={<ProblemPage />} />
                <Route path="/problem/:id" element={<ProblemDetail />} />

                {/* test */}
                <Route path="/markdown" element={<MarkdownEditor />} />

                {/* auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot" element={<ForgotPassword />} />
                <Route path="/reset" element={<ResetPassword />} />

                {/* course */}
                <Route path="/courses" element={<CoursePage />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/learn" element={<LearnThroughVideoAndText />} />

                {/* error */}
                <Route path="/401" element={<UnauthorisedError />} />
                <Route path="/403" element={<ForbiddenError />} />
                <Route path="/404" element={<NotFoundError />} />
                <Route path="/500" element={<GeneralError />} />
                <Route path="/503" element={<MaintenanceError />} />
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

