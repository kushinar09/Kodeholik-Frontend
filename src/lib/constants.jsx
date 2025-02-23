import React from "react"

import logo from "@/assets/images/logo/kodeholik_logo.png"

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

const API_URL = import.meta.env.VITE_API_URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const ENDPOINTS = {
  // Auth
  POST_LOGIN: `${API_URL}/auth/login`,
  LOGIN_GOOGLE: `${BACKEND_URL}/oauth2/authorization/google`,
  LOGIN_GITHUB: `${BACKEND_URL}/oauth2/authorization/github`,
  GET_INFOR: `${API_URL}/user/current`,
  ROTATE_TOKEN: `${API_URL}/auth/rotate-token`,

  POST_FORGOT_PASSWORD: `${API_URL}/auth/reset-password-init?username=:gmail`,
  GET_CHECK_RESET_TOKEN: `${API_URL}/auth/reset-password-check?token=:token`,
  POST_RESET_PASSWORD: `${API_URL}/auth/reset-password-finish?token=:token`,

  GET_USER_INFO: `${API_URL}/user/info`,
  POST_UPDATE_USER_PROFILE: `${API_URL}/user/update`,
  POST_LOGOUT: `${API_URL}/logout`,

  // Problems
  POST_PROBLEMS_LIST: `${API_URL}/problem/search`,
  GET_PROBLEM_DESCRIPTION: `${API_URL}/problem/description/:id`,
  GET_PROBLEM_INIT_CODE: `${API_URL}/problem/compile-information/:id`,
  GET_PROBLEM_COMMENTS: `${API_URL}/comment/problem/:id?page=0&sortBy=createdAt&ascending=false`,
  GET_PROBLEM_EDITORIAL: `${API_URL}/problem/description/:id`,
  GET_PROBLEM_SOLUTIONS: `${API_URL}/problem/description/:id`,
  GET_PROBLEM_SUBMISSIONS: `${API_URL}/problem/description/:id`,
  GET_SEARCH_PROBLEM: `${API_URL}/problem/search`,
  POST_CREATE_PROBLEM: `${API_URL}/problem/create`,
  POST_UPDATE_PROBLEM: `${API_URL}/problem/update/:id`,
  POST_DELETE_PROBLEM: `${API_URL}/problem/delete/:id`,

  // courses
  GET_COURSES: `${API_URL}/course/list`,
  GET_COURSE: `${API_URL}/course/description/:id`,
  SEARCH_COURSE: `${API_URL}/course/search`,
  CREATE_COURSE: `${API_URL}/course/create`,
  UPDATE_COURSE: `${API_URL}/course/update/:id`,
  DELETE_COURSE: `${API_URL}/course/delete/:id`,

  // code
  POST_RUN_CODE: `${API_URL}/problem-submission/run/:id`,
  POST_SUBMIT_CODE: `${API_URL}/problem-submission/submit/:id`
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
