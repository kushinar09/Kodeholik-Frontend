// Helper function to generate random past dates in human-readable format
const getRandomTimeAgo = () => {
  const options = [
    "Just now",
    "2 min ago",
    "5 min ago",
    "10 min ago",
    "30 min ago",
    "1 hour ago",
    "2 hours ago",
    "5 hours ago",
    "Yesterday",
    "2 days ago",
    "Last week"
  ]

  return options[Math.floor(Math.random() * options.length)]
}

export const mockNotifications = [
  {
    id: "1",
    title: "New Problem Available",
    message: "A new algorithm challenge \"Binary Tree Traversal\" has been added to your course.",
    time: "5 min ago",
    read: false,
    type: "problem",
    link: "/problems/binary-tree-traversal"
  },
  {
    id: "2",
    title: "Exam Reminder",
    message: "Your scheduled examination \"Data Structures\" starts in 24 hours.",
    time: "1 hour ago",
    read: false,
    type: "exam",
    link: "/examination/data-structures"
  },
  {
    id: "3",
    title: "Discussion Reply",
    message: "Alex replied to your question about recursion: \"The base case is crucial because...\"",
    time: "Yesterday",
    read: true,
    type: "message",
    link: "/discuss/thread/123"
  },
  {
    id: "4",
    title: "Achievement Unlocked",
    message: "Congratulations! You've solved 50 problems and earned the \"Problem Solver\" badge.",
    time: "2 days ago",
    read: true,
    type: "system"
  },
  {
    id: "5",
    title: "Course Update",
    message: "The \"Advanced JavaScript\" course has been updated with new content on Promises.",
    time: "3 days ago",
    read: false,
    type: "course",
    link: "/courses/advanced-javascript"
  },
  {
    id: "6",
    title: "Weekly Challenge",
    message: "This week's coding challenge is now available. Try to solve \"Dynamic Programming: Coin Change\".",
    time: "4 days ago",
    read: true,
    type: "problem",
    link: "/problems/coin-change"
  },
  {
    id: "7",
    title: "System Maintenance",
    message: "The platform will be undergoing maintenance on Sunday from 2AM to 4AM UTC.",
    time: "5 days ago",
    read: true,
    type: "system"
  },
  {
    id: "8",
    title: "New Message",
    message: "You have a new message from your mentor regarding your recent submission.",
    time: "Last week",
    read: false,
    type: "message",
    link: "/messages/inbox/456"
  },
  {
    id: "9",
    title: "Problem Solved",
    message: "Your solution to \"Graph Algorithms: Shortest Path\" has been accepted!",
    time: "Last week",
    read: true,
    type: "problem"
  },
  {
    id: "10",
    title: "Course Completion",
    message: "You've completed 75% of \"Data Structures and Algorithms\". Keep going!",
    time: "Last week",
    read: true,
    type: "course",
    link: "/courses/data-structures-algorithms"
  }
]

// Function to generate a larger set of random notifications
export function generateRandomNotifications(count = 20) {
  const types = ["problem", "exam", "message", "system", "course"]
  const titles = [
    "New Problem Available",
    "Exam Reminder",
    "Discussion Reply",
    "Achievement Unlocked",
    "Course Update",
    "Weekly Challenge",
    "System Maintenance",
    "New Message",
    "Problem Solved",
    "Course Completion",
    "Submission Feedback",
    "Contest Starting Soon",
    "Friend Request",
    "Study Group Invitation",
    "New Feature Announcement"
  ]

  const messages = [
    "A new algorithm challenge has been added to your course.",
    "Your scheduled examination starts soon.",
    "Someone replied to your question.",
    "Congratulations! You've earned a new badge.",
    "Your course has been updated with new content.",
    "This week's coding challenge is now available.",
    "The platform will be undergoing maintenance soon.",
    "You have a new message from your mentor.",
    "Your solution has been accepted!",
    "You've made progress in your course. Keep going!",
    "Your instructor has provided feedback on your submission.",
    "A coding contest is starting in 1 hour. Join now!",
    "You have a new friend request from a fellow coder.",
    "You've been invited to join a study group on algorithms.",
    "Check out our new code editor features!"
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: (i + 11).toString(),
    title: titles[Math.floor(Math.random() * titles.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    time: getRandomTimeAgo(),
    read: Math.random() > 0.3, // 30% chance of being unread
    type: types[Math.floor(Math.random() * types.length)],
    link: Math.random() > 0.3 ? `/random-link/${i + 11}` : undefined
  }))
}

// Export both fixed and random notifications
export const allMockNotifications = [...mockNotifications, ...generateRandomNotifications(15)]

