"use client"

import { Link } from "react-router-dom"
import UserActionMenu from "../other/user-action-menu"

export default function HeaderSection() {
  return (
    <div className="z-10 w-full sticky top-0 px-24 pt-4 pb-2 bg-primary-bg">
      <div className="absolute inset-x-0 -bottom-4 h-4 bg-gradient-to-b from-primary-bg to-transparent pointer-events-none" />
      <nav className="relative flex items-center justify-between p-4 bg-bg-card rounded-2xl">
        <div className="flex items-center space-x-6">
          <Link to="#" className="text-primary px-4 py-2 hover:text-white">
            Explore
          </Link>
          <Link to="#" className="rounded-md px-4 py-2 bg-primary text-black font-bold">
            Problems
          </Link>
          <Link to="#" className="text-primary px-4 py-2 hover:text-white">
            Contest
          </Link>
          <Link to="#" className="text-primary px-4 py-2 hover:text-white">
            Discuss
          </Link>
          <Link to="#" className="text-primary px-4 py-2 hover:text-white">
            Courses
          </Link>
        </div>

        {/* Using the extracted UserActionMenu component */}
        <UserActionMenu />
      </nav>
    </div>
  )
}

