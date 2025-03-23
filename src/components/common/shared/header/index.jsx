"use client"

import { Link } from "react-router-dom"
import UserActionMenu from "../other/user-action-menu"
import Notification from "../other/notification"

export default function HeaderSection({ currentActive = "Problems" }) {
  return (
    <div className="z-10 w-full sticky top-0 px-24 pt-4 pb-2 bg-primary-bg">
      <div className="absolute inset-x-0 -bottom-4 h-4 bg-gradient-to-b from-primary-bg to-transparent pointer-events-none" />
      <nav className="relative flex items-center justify-between p-4 bg-bg-card rounded-2xl">
        <div className="flex items-center space-x-6">
          {/* <Link to="#" className="text-primary px-4 py-2 hover:text-white">
            Explore
          </Link> */}
          <Link to="/" className={`rounded-md px-4 py-2 ${currentActive === "problem" ? "bg-primary text-black font-bold" : "hover:text-white text-primary"}`}>
            Problems
          </Link>
          <Link to="/exam" className={`rounded-md px-4 py-2 ${currentActive === "exam" ? "bg-primary text-black font-bold" : "hover:text-white text-primary"}`}>
            Examination
          </Link>
          <Link to="#" className={`rounded-md px-4 py-2 ${currentActive === "discuss" ? "bg-primary text-black font-bold" : "hover:text-white text-primary"}`}>
            Discuss
          </Link>
          <Link to="/course" className={`rounded-md px-4 py-2 ${currentActive === "course" ? "bg-primary text-black font-bold" : "hover:text-white text-primary"}`}>
            Courses
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Notification />
          <UserActionMenu />
        </div>
      </nav>
    </div>
  )
}

