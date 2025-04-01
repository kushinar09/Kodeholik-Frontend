import React from "react"

import logo from "@/assets/images/logo/K_nobg.png"

const LOGO = React.forwardRef(({ className, ...props }, ref) => {
  return <img src={logo} className={className} alt="Kodeholik" ref={ref} {...props} />
})

const GLOBALS = {
  APPLICATION_NAME: import.meta.env.VITE_APP_NAME,
  SPONSORS: ["FPT University"],
  REFERENCES: [
    {
      name: "Leetcode",
      link: "https://leetcode.com"
    },
    {
      name: "Hackerrank",
      link: "https://hackerrank.com"
    },
    {
      name: "Codelearn",
      link: "https://codelearn.io"
    }
  ]
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:8080/ws"

const ENDPOINTS = {
  // Web socket
  WEBSOCKET: WEBSOCKET_URL,
  WEBSOCKET_NOTIFICATION: `${WEBSOCKET_URL}/notification?token=:token`,
  WEBSOCKET_EXAM: `${WEBSOCKET_URL}?token=:token`,

  // Notification
  GET_NOTIFICATIONS: `${API_URL}/user/notifications`,
  GET_NOTIFICATIONS_TOKEN: `${API_URL}/auth/get-token-noti`,

  // Auth
  POST_LOGIN: `${API_URL}/auth/login`,
  LOGIN_GOOGLE: `${BACKEND_URL}/oauth2/authorization/google`,
  LOGIN_GITHUB: `${BACKEND_URL}/oauth2/authorization/github`,
  GET_INFOR: `${API_URL}/user/current`,
  ROTATE_TOKEN: `${API_URL}/auth/rotate-token`,
  POST_LOGOUT: `${API_URL}/auth/logout`,
  PUT_CHANGE_PASSWORD: `${API_URL}/auth/change-password`,
  POST_FORGOT_PASSWORD: `${API_URL}/auth/reset-password-init?username=:gmail`,
  GET_CHECK_RESET_TOKEN: `${API_URL}/auth/reset-password-check?token=:token`,
  POST_RESET_PASSWORD: `${API_URL}/auth/reset-password-finish?token=:token`,

  // Problems
  POST_PROBLEMS_LIST: `${API_URL}/problem/search`,
  GET_PROBLEM_DESCRIPTION: `${API_URL}/problem/description/:id`,
  GET_PROBLEM_EDITORIAL: `${API_URL}/problem/editorial/:id`,
  GET_PROBLEM_INIT_CODE: `${API_URL}/problem/compile-information/:id`,
  GET_PROBLEM_LANGUAGES_SUPPORT: `${API_URL}/problem/language-support/:id`,
  GET_PROBLEM_COMMENTS: `${API_URL}/comment/problem/:id`,
  POST_COMMENT: `${API_URL}/comment/post`,
  GET_COMMENTS_REPLY: `${API_URL}/comment/list-reply/`,
  UPVOTE_COMMENT: `${API_URL}/comment/upvote/`,
  UNUPVOTE_COMMENT: `${API_URL}/comment/unupvote/`,
  EDIT_COMMENT: `${API_URL}/comment/edit/`,
  GET_PROBLEM_SOLUTIONS: `${API_URL}/problem-solution/list/:id`,
  GET_PROBLEM_SUBMISSIONS: `${API_URL}/problem-submission/list/:id`,
  GET_SUBMISSION_DETAIL: `${API_URL}/problem-submission/detail/`,
  GET_TOPICS_PROBLEM: `${API_URL}/tag/all-topic`,
  GET_SKILLS_PROBLEM: `${API_URL}/tag/all-skill`,
  GET_STATS_PROBLEM: `${API_URL}/problem/no-achieved-info`,

  // Solutions
  GET_SOLUTION_DETAIL: `${API_URL}/problem-solution/detail/:id`,
  GET_SOLUTION_COMMENTS: `${API_URL}/comment/problem-solution/:id`,
  POST_SOLUTION: `${API_URL}/problem-solution/post-solution`,
  UPVOTE_SOLUTION: `${API_URL}/problem-solution/upvote/`,
  UNUPVOTE_SOLUTION: `${API_URL}/problem-solution/unupvote/`,
  EDIT_SOLUTION: `${API_URL}/problem-solution/edit-solution/`,

  // Submissions
  GET_SUCCESS_SUBMISSION: `${API_URL}/problem-submission/success-list/`,

  // Search
  GET_SUGGEST_SEARCH: `${API_URL}/problem/suggest?searchText=:text`,

  // courses
  GET_COURSES_LIST: `${API_URL}/course/search`,
  GET_COURSE: `${API_URL}/course/detail/:id`,
  ENROLL_COURSE: `${API_URL}/course/enroll/:id`,
  UNENROLL_COURSE: `${API_URL}/course/unenroll/:id`,
  RATE_COMMENT_COURSE: `${API_URL}/course/rate`,
  GET_COMMENT_COURSE: `${API_URL}/course/rating/:id`,
  CHECK_ENROLL: `${API_URL}/course/enroll/check/:id`,
  GET_TOP_COURSES: `${API_URL}/course/top-popular`,
  COURSE_REGISTER_IN: `${API_URL}/course/register-start/:id`,
  COURSE_REGISTER_OUT: `${API_URL}/course/register-end/:id`,
  GET_COURSE_DISCUSSION: `${API_URL}/course/discussion/:id`,
  GET_DISCUSSION_REPLY: `${API_URL}/course/list-reply/:id`,
  POST_COURSE_DISCUSSION: `${API_URL}/course/comment`,
  UPVOTE_COURSE_DISCUSSION: `${API_URL}/comment/upvote/:id`,
  UN_UPVOTE_COURSE_DISCUSSION: `${API_URL}/comment/unupvote/:id`,

  //Lesson
  GET_LESSON_DETAIL: `${API_URL}/lesson/detail/:id`,
  CREATE_LESSON: `${API_URL}/lesson/add`,
  COMPLETED_LESSON: `${API_URL}/lesson/complete/:id`,

  //Topic
  GET_TOPIC_LIST: `${API_URL}/tag/all-topic`,

  // code
  POST_RUN_CODE: `${API_URL}/problem-submission/run/:id`,
  POST_SUBMIT_CODE: `${API_URL}/problem-submission/submit/:id`,

  //User
  GET_PROFILE: `${API_URL}/user/current`,
  POST_EDIT_PROFILE: `${API_URL}/user/edit-profile`,
  GET_NUMBER_LANGUAGE_SOLVED: `${API_URL}/problem-submission/number-language`,
  GET_NUMBER_TOPIC_SOLVED: `${API_URL}/problem-submission/number-topic`,
  GET_NUMBER_SKILL_SOLVED: `${API_URL}/problem-submission/number-skill`,
  GET_ACCEPTANCE_RATE: `${API_URL}/problem-submission/acceptance-rate`,
  GET_MY_PROGRESS: `${API_URL}/problem-submission/my-progress`,
  GET_MY_SUBMISSION: `${API_URL}/problem-submission/my-submission`,
  GET_MY_FAVOURITE: `${API_URL}/problem/list-favourite`,
  TAG_FAVOURITE: `${API_URL}/problem/tag-favourite/`,
  UNTAG_FAVOURITE: `${API_URL}/problem/untag-favourite/`,

  //DownloadFile lesson
  DOWNLOAD_FILE_LESSON: (fileKey) => `${API_URL}/lesson/download-file?key=${encodeURIComponent(fileKey)}`,

  //image
  GET_IMAGE: (imageKey) => `${API_URL}/s3/presigned-url?key=${encodeURIComponent(imageKey)}`,
  POST_UPLOAD_IMAGE: `${API_URL}/s3/upload`,

  // Exam
  GET_LIST_EXAM: `${API_URL}/exam/pending-list`,
  GET_MY_LIST_EXAM: `${API_URL}/exam/list`,
  GET_TOKEN_EXAM: `${API_URL}/exam/get-token/:id`,
  POST_ENROLL_EXAM: `${API_URL}/exam/enroll/:id`,
  POST_UNENROLL_EXAM: `${API_URL}/exam/unenroll/:id`,
  POST_RUN_EXAM: `${API_URL}/exam/run/:id?link=:idProblem`,
  GET_EXAM_RESULT: `${API_URL}/exam/result/:id`
}

const CONSTANTS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USERNAME: "username",
  USER_ID: "uid"
}

export {
  LOGO,
  GLOBALS,
  ENDPOINTS,
  CONSTANTS
}
