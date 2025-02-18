import React from "react"

const LOGO = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (
      <img src="./src/assets/images/logo/kodeholik_logo.png" className={className} alt="Kodeholik" ref={ref} {...props} />
    )
  )
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
  LOGIN: `${API_URL}/auth/login`,
  LOGIN_GOOGLE: `${BACKEND_URL}/oauth2/authorization/google`,
  LOGIN_GITHUB: `${BACKEND_URL}/oauth2/authorization/github`,

  FORGOT_PASSWORD: `${API_URL}/auth/reset-password-init?username=:gmail`,
  CHECK_RESET_TOKEN: `${API_URL}/auth/reset-password-check?token=:token`,
  RESET_PASSWORD: `${API_URL}//auth/reset-password-finish?token=:token`,

  GET_USER_INFO: `${API_URL}/user/info`,
  UPDATE_USER_PROFILE: `${API_URL}/user/update`,
  LOGOUT: `${API_URL}/logout`,

  // Problems
  GET_PROBLEMS: `${API_URL}/problem/list`,
  GET_PROBLEM: `${API_URL}/problem/description/:id`,
  SEARCH_PROBLEM: `${API_URL}/problem/search`,
  CREATE_PROBLEM: `${API_URL}/problem/create`,
  UPDATE_PROBLEM: `${API_URL}/problem/update/:id`,
  DELETE_PROBLEM: `${API_URL}/problem/delete/:id`
}

const CONSTANTS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USERNAME: "username",
  USER_ID: "uid"
}

export {
  LOGO,
  GLOBALS,
  ENDPOINTS,
  CONSTANTS
}
