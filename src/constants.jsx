// const LogoSite = ({ props }) => (
//   <img src="./src/assets/logo/logo_nobackground.png" alt="Logo" {...props} />
// )

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
  LOGIN: `${API_URL}/login`,
  LOGIN_GOOGLE: `${BACKEND_URL}/oauth2/authorization/google`,
  SIGNUP: `${API_URL}/register`,
  GET_USER_INFO: `${API_URL}/user/info`,
  UPDATE_USER_PROFILE: `${API_URL}/user/update`,
  LOGOUT: `${API_URL}/logout`,

  // problems
  GET_PROBLEMS:   `${API_URL}/problem/list`,
  GET_PROBLEM:    `${API_URL}/problem/description/:id`,
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
  //   LogoSite,
  GLOBALS,
  ENDPOINTS,
  CONSTANTS
}
