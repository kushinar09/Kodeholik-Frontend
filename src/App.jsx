import { Suspense, lazy } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./providers/AuthProvider"
import { SocketProvider } from "./providers/SocketNotificationProvider"
import { SocketExamProvider } from "./providers/SocketExamProvider"
import { Toaster } from "sonner"
import LoadingScreen from "./components/common/shared/other/loading"

// Lazy load all components
const ProblemDetail = lazy(() => import("./components/pages/problems/ProblemDetail"))
const ForgotPassword = lazy(() => import("./components/pages/authentications/forgot"))
const LoginPage = lazy(() => import("./components/pages/authentications/login"))
const ResetPassword = lazy(() => import("./components/pages/authentications/reset"))
const CoursePage = lazy(() => import("./components/pages/courses/ViewCoursePage"))
const CourseDetail = lazy(() => import("./components/pages/courses/CourseDetail/index"))
const LearnThroughVideoAndText = lazy(() => import("./components/pages/courses/learnLesson/LearnThroughVideoAndText"))
const ProblemPage = lazy(() => import("./components/pages/problems/ProblemList"))
const UnauthorisedError = lazy(() => import("./components/pages/errors/unauthorized-error"))
const ForbiddenError = lazy(() => import("./components/pages/errors/forbidden"))
const NotFoundError = lazy(() => import("./components/pages/errors/not-found-error"))
const GeneralError = lazy(() => import("./components/pages/errors/general-error"))
const MaintenanceError = lazy(() => import("./components/pages/errors/maintenance-error"))
const WaitingRoom = lazy(() => import("./components/pages/exam/waiting-room"))
const CreateCourse = lazy(() => import("./components/pages/courses/CreateCourse"))
const UpdateCourse = lazy(() => import("./components/pages/courses/UpdateCourse"))
const ExamList = lazy(() => import("./components/pages/exam/list"))
const Profile = lazy(() => import("./components/pages/profile"))
const ShareSolution = lazy(() => import("./components/pages/problems/ShareSolution"))
const ExamProblems = lazy(() => import("./components/pages/exam/exam-problem"))
const CourseDiscussion = lazy(() => import("./components/pages/courses/CourseDetail/components/CourseDiscussion"))
const NotificationsPage = lazy(() => import("./components/pages/notification"))

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <div className="mx-auto">
              <Suspense fallback={<LoadingScreen />}>
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
                  <Route path="/share-solution/:link/:submission" element={<ShareSolution />} />

                  {/* auth */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot" element={<ForgotPassword />} />
                  <Route path="/reset" element={<ResetPassword />} />

                  {/* notification */}
                  <Route path="/notifications" element={<NotificationsPage />} />

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
              </Suspense>
            </div>
          </SocketProvider>
        </AuthProvider>
      </Router>
      <Toaster richColors />
    </>
  )
}

export default App

