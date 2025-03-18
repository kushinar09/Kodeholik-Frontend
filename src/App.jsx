import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ProblemDetail from "./components/pages/problems/ProblemDetail"
import ForgotPassword from "./components/pages/authentications/forgot"
import LoginPage from "./components/pages/authentications/login"
import ResetPassword from "./components/pages/authentications/reset"
import CoursePage from "./components/pages/courses/ViewCoursePage"
import CourseDetail from "./components/pages/courses/CourseDetail/index"

import LearnThroughVideoAndText from "./components/pages/courses/learnLesson/LearnThroughVideoAndText"
import ProblemPage from "./components/pages/problems/ProblemList"
import { AuthProvider } from "./providers/AuthProvider"
import TakeExam from "./components/pages/exam/take-exam"
import UnauthorisedError from "./components/pages/errors/unauthorized-error"
import ForbiddenError from "./components/pages/errors/forbidden"
import NotFoundError from "./components/pages/errors/not-found-error"
import GeneralError from "./components/pages/errors/general-error"
import MaintenanceError from "./components/pages/errors/maintenance-error"
import WaitingRoom from "./components/pages/exam/waiting-room"
import CreateCourse from "./components/pages/courses/CreateCourse"
import UpdateCourse from "./components/pages/courses/UpdateCourse"
import ExamList from "./components/pages/exam/list"
import WebSocketComponent from "./components/pages/exam/take-exam/test"
import Profile from "./components/pages/profile"
import CourseDiscussion from "./components/pages/courses/CourseDiscussion"
import ShareSolution from "./components/pages/problems/ShareSolution"
import { Toaster } from "sonner"
import { SocketProvider } from "./providers/SocketNotificationProvider"
import ExamProblems from "./components/pages/exam/exam-problem"
import { SocketExamProvider } from "./providers/SocketExamProvider"

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <div className="mx-auto">
              <Routes>
                {/* exam */}
                <Route path="/exam" element={<ExamList />} />
                <Route
                  path="/exam/*"
                  element={
                    <SocketExamProvider>
                      <Routes>
                        <Route path=":id/wait" element={<WaitingRoom />} />
                        <Route path=":id" element={<ExamProblems />} />
                        <Route path="*" element={<NotFoundError />} />
                      </Routes>
                    </SocketExamProvider>
                  }
                />

                {/* problem */}
                <Route path="/" element={<ProblemPage />} />
                <Route path="/problems" element={<ProblemPage />} />
                <Route path="/problem/:id" element={<ProblemDetail />} />
                <Route path="/problem-submission/:id/:submission" element={<ProblemDetail />} />
                <Route path="/problem-solution/:id/:solution" element={<ProblemDetail />} />
                {/* test */}
       
                <Route path="/share-solution/:link/:submission" element={<ShareSolution/>} />
                <Route path="/socket" element={<WebSocketComponent />} />
                {/* auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot" element={<ForgotPassword />} />
                <Route path="/reset" element={<ResetPassword />} />

                {/* course */}
                <Route path="/courses" element={<CoursePage />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/courses/add" element={<CreateCourse />} />
                <Route path="/courses/update/:id" element={<UpdateCourse />} />
                <Route path="/learn" element={<LearnThroughVideoAndText />} />
                {/* profile */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/learn/:id" element={<LearnThroughVideoAndText />} />
                <Route path="/course/discusdion" element={<CourseDiscussion />} />


                {/* error */}
                <Route path="/401" element={<UnauthorisedError />} />
                <Route path="/403" element={<ForbiddenError />} />
                <Route path="/404" element={<NotFoundError />} />
                <Route path="/500" element={<GeneralError />} />
                <Route path="/503" element={<MaintenanceError />} />
                <Route path="*" element={<NotFoundError />} />
              </Routes>
            </div>
          </SocketProvider>
        </AuthProvider>
      </Router>
      <Toaster richColors />
    </>
  )
}

export default App

