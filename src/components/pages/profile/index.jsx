"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, User, Edit, KeyRound, Circle, ChevronUp, ChevronDown } from "lucide-react"
import FooterSection from "@/components/common/shared/footer"
import HeaderSection from "@/components/common/shared/header"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { changePassword, editProfile, getAcceptanceRate, getNumberLanguageSolved, getNumberSkillSolved, getNumberTopicSolved, getUserProfile } from "../../../lib/api/user_api"
import { useAuth } from "@/providers/AuthProvider"
import { EditProfileDialog } from "./edit"
import LoadingScreen from "@/components/common/shared/other/loading"
import { ChangePasswordDialog } from "./change-password"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ENDPOINTS } from "@/lib/constants"
import { RadialChart } from "@/components/common/shared/other/radial-chart"
import MyProgress from "./my-progress"
import MySubmission from "./my-submission"
import MyFavourite from "./my-favourite"
import Tabs from "./components/tabs"
import { toast } from "sonner"

export default function Profile() {
  const { isAuthenticated, apiCall } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [rates, setRates] = useState(null)
  const [isTopicOpen, setIsTopicOpen] = useState(true)
  const [isSkillOpen, setIsSkillOpen] = useState(true)
  const [isLanguageOpen, setIsLanguageOpen] = useState(true)
  const [languageSolved, setLanguageSolved] = useState(null)
  const [topicSolved, setTopicSolved] = useState(null)
  const [fundamentalSkillSolved, setFundamentalSkillSolved] = useState(null)
  const [intermediateSkillSolved, setIntermediateSkillSolved] = useState(null)
  const [advancedSolved, setAdvancedSkillSolved] = useState(null)
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [profile, setProfile] = useState({
    avatarFile: null,
    avatarImg: "",
    username: "",
    fullname: ""
  })
  const tabs = [
    {
      label: "My Progress",
      content: <MyProgress />
    },
    {
      label: "My Submission",
      content: <MySubmission />
    },
    {
      label: "My Favourite",
      content: <MyFavourite />
    }
  ]

  const fetchCurrentUserProfile = async () => {
    try {
      setIsLoading(true)
      const data = await getUserProfile(apiCall)
      console.log(data)
      setCurrentUser(data)
      setProfile({
        avatarFile: null,
        avatarImg: data.avatar,
        username: data.username,
        fullname: data.fullname,
        email: data.email
      })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLanguageSolved = async () => {
    try {
      setIsLoading(true)
      const data = await getNumberLanguageSolved(apiCall)
      setLanguageSolved(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAdvancedSkillSolved = async () => {
    try {
      setIsLoading(true)
      const data = await getNumberSkillSolved(apiCall, "ADVANCED")
      setAdvancedSkillSolved(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchIntermediateSkillSolved = async () => {
    try {
      setIsLoading(true)
      const data = await getNumberSkillSolved(apiCall, "INTERMEDIATE")
      setIntermediateSkillSolved(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFundamentalSkillSolved = async () => {
    try {
      setIsLoading(true)
      const data = await getNumberSkillSolved(apiCall, "FUNDAMENTAL")
      setFundamentalSkillSolved(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTopicSolved = async () => {
    try {
      setIsLoading(true)
      const data = await getNumberTopicSolved(apiCall)
      console.log(data)
      setTopicSolved(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { redirectPath: window.location.pathname } })
      return
    }
    fetchCurrentUserProfile()
    fetchLanguageSolved()
    fetchAdvancedSkillSolved()
    fetchFundamentalSkillSolved()
    fetchIntermediateSkillSolved()
    fetchTopicSolved()
    fetchStats()
    fetchAcceptanceRate()
  }, [isAuthenticated])

  const handleEditProfile = (profile) => {
    const formData = new FormData()
    if (profile.avatarFile != null) {
      formData.append("avatar", profile.avatarFile)
    }
    formData.append("username", profile.username)
    formData.append("fullname", profile.fullname)
    editUserProfile(formData)
  }

  const handleChangePassword = (formPassword) => {
    changeUserPassword(formPassword)
  }


  const editUserProfile = async (profile) => {
    try {
      const data = await editProfile(apiCall, profile)
      setCurrentUser(data)
      setProfile((prev) => ({
        ...prev,
        avatarFile: null,
        avatarImg: data.avatar,
        username: data.username,
        fullname: data.fullname
      }))
    } catch (error) {
      toast.error("Edit Profile", {
        description: error.message || "Edit profile failed. Please try again"
      })
    } finally {
      toast.success("Edit Profile", {
        description: "Edit profile successful"
      })
      setIsEditProfileDialogOpen(false)
    }
  }

  const changeUserPassword = async (formPassword) => {
    try {
      await changePassword(apiCall, formPassword)
      toast.success("Change Password", {
        description: "Change password successful. Please login again"
      })
      setIsChangePasswordDialogOpen(false)
      window.location.href = "/login"
    } catch (error) {
      toast.error(error.message)
    }
  }
  const getColorForLabel = (label) => {
    switch (label) {
      case "EASY":
        return "rgb(74, 222, 128)"
      case "MEDIUM":
        return "rgb(234, 179, 8)"
      case "HARD":
        return "rgb(239, 68, 68)"
      default:
        return "#ccc"
    }
  }
  const fetchStats = async () => {
    try {
      const response = await apiCall(ENDPOINTS.GET_STATS_PROBLEM)
      const data = await response.json()

      const transformedStats = {
        mainLabel: "Solved",
        mainCount: data.find(item => item.name === "ALL")?.noAchived || 0,
        mainTotal: data.find(item => item.name === "ALL")?.noTotal || 0,
        mainColor: "#98ff99",
        sideStats: data
          .filter(item => item.name !== "ALL")
          .map(item => ({
            label: item.name.charAt(0) + item.name.slice(1).toLowerCase(),
            count: item.noAchived,
            total: item.noTotal,
            color: getColorForLabel(item.name)
          })),
        className: ""
      }
      console.log(transformedStats)
      setStats(transformedStats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchAcceptanceRate = async () => {
    try {
      const response = await getAcceptanceRate(apiCall)

      const transformedStats = {
        mainLabel: "Accepted",
        mainCount: response.rate,
        mainTotal: response.total,
        mainColor: "#98ff99",
        sideStats: [],
        className: "w-full"
      }
      console.log(transformedStats)
      setRates(transformedStats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <>
      {isLoading && <LoadingScreen />}
      {!isLoading && isAuthenticated &&
        <div className="min-h-screen bg-bg-primary">
          <HeaderSection />
          {/* Main Content */}
          <main className="p-4 px-36">
            {/* Study Plan Section */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-8">
              <div className="md:col-span-3">
                {currentUser != null &&
                  <Card className="p-6 md:p-8 bg-bg-card border-none">
                    <CardContent>
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                          <Avatar className="w-24 h-24 border-2 border-primary rounded-full bg-white">
                            <AvatarImage src={currentUser.avatar} alt={currentUser.username} className="object-cover" />
                            <AvatarFallback className="text-2xl font-bold">U</AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="text-center md:text-left space-y-2 flex-1">
                          <h2 className="font-bold text-2xl text-primary">{currentUser.username}</h2>
                          <div className="flex flex-col gap-1.5 text-muted-foreground">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <User className="h-4 w-4 text-primary-text" />
                              <span className="text-primary-text">{currentUser.fullname}</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 truncate max-w-xs">
                              <Mail className="h-4 w-4 flex-shrink-0 text-primary-text" />
                              <span className="truncate text-primary-text">{currentUser.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                        <Button onClick={() => setIsEditProfileDialogOpen(true)} className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                        <Button onClick={() => setIsChangePasswordDialogOpen(true)} variant="outline" className="flex items-center gap-2">
                          <KeyRound className="h-4 w-4" />
                          Change Password
                        </Button>
                      </div>
                    </CardContent>

                    <CardContent>
                      {languageSolved != null &&
                        <div className="mt-6">
                          <div className="flex justify-between">
                            <div className="font-bold text-md text-primary-text">
                              Languages
                            </div>
                            <div className="cursor-pointer" onClick={() => setIsLanguageOpen(!isLanguageOpen)}>
                              {isLanguageOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                            </div>
                          </div>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: isLanguageOpen ? 1 : 0, height: isLanguageOpen ? "auto" : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4">
                              {languageSolved.map((language) => (
                                <div key={language.name} className="flex justify-between items-center mt-4 text-sm">
                                  <div className="text-primary-text border-2 rounded-xl px-3 py-1 bg-gray-800">
                                    {language.name}
                                  </div>
                                  <div className="text-primary-text">
                                    <span className="font-bold">{language.number}</span> problems solved
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      }

                      {topicSolved != null &&
                        <div className="mt-6">
                          <div className="flex justify-between">
                            <div className="font-bold text-md text-primary-text">
                              Topics
                            </div>
                            <div className="cursor-pointer" onClick={() => setIsTopicOpen(!isTopicOpen)}>
                              {isTopicOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                            </div>
                          </div>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: isTopicOpen ? 1 : 0, height: isTopicOpen ? "auto" : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-row flex-wrap text-sm">
                              {topicSolved.map((topic) => (
                                <div key={topic.name} className="flex items-center mt-4">
                                  <div className="text-primary-text border-2 rounded-xl px-3 py-1 bg-gray-800">
                                    {topic.name}
                                  </div>
                                  <div className="text-primary-text ml-2 mr-4">
                                    <span className="font-bold">x{topic.number}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                          </motion.div>
                        </div>
                      }

                      {(fundamentalSkillSolved != null || intermediateSkillSolved != null || advancedSolved != null) &&
                        <div className="mt-6">
                          <div className="flex justify-between">
                            <div className="font-bold text-md text-primary-text">
                              Skills
                            </div>
                            <div className="cursor-pointer" onClick={() => setIsSkillOpen(!isSkillOpen)}>
                              {isSkillOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                            </div>
                          </div>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: isSkillOpen ? 1 : 0, height: isSkillOpen ? "auto" : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-row flex-wrap text-sm">
                              {fundamentalSkillSolved != null &&
                                <div>
                                  <div className="flex mt-6 items-center">
                                    <div>
                                      <Circle className={"h-4 w-4 fill-green-500 text-green-500"} />
                                    </div>
                                    <div className="ml-2 text-primary-text font-bold">
                                      Fundamental
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap">
                                    {fundamentalSkillSolved.map((skill) => (
                                      <div key={skill.name} className="flex items-center mt-4">
                                        <div className="text-primary-text border-2 rounded-xl px-3 py-1 bg-gray-800">
                                          {skill.name}
                                        </div>
                                        <div className="text-primary-text ml-2 mr-4">
                                          <span className="font-bold">x{skill.number}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              }

                              {intermediateSkillSolved != null &&
                                <div>
                                  <div className="flex mt-6 items-center">
                                    <div>
                                      <Circle className={"h-4 w-4 fill-yellow-500 text-yellow-500"} />
                                    </div>
                                    <div className="ml-2 text-primary-text font-bold">
                                      Intermediate
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap">
                                    {intermediateSkillSolved.map((skill) => (
                                      <div key={skill.name} className="flex items-center mt-4">
                                        <div className="text-primary-text border-2 rounded-xl px-3 py-1 bg-gray-800">
                                          {skill.name}
                                        </div>
                                        <div className="text-primary-text ml-2 mr-4">
                                          <span className="font-bold">x{skill.number}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              }

                              {advancedSolved != null &&
                                <div>
                                  <div className="flex mt-6 items-center">
                                    <div>
                                      <Circle className={"h-4 w-4 fill-red-500 text-red-500"} />
                                    </div>
                                    <div className="ml-2 text-primary-text font-bold">
                                      Advanced
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap">
                                    {advancedSolved.map((skill) => (
                                      <div key={skill.name} className="flex items-center mt-4">
                                        <div className="text-primary-text border-2 rounded-xl px-3 py-1 bg-gray-800">
                                          {skill.name}
                                        </div>
                                        <div className="text-primary-text ml-2 mr-4">
                                          <span className="font-bold">x{skill.number}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              }

                            </div>
                          </motion.div>
                        </div>
                      }
                    </CardContent>
                  </Card>}
              </div>
              <div className="md:col-span-5 bg-bg-card border-2 border-black rounded-lg">
                <div className="items-center grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-1 ">
                    {stats != null &&
                      <Card className=" bg-bg-card border-0 aspect-video rounded-xl">
                        <RadialChart {...stats} />
                      </Card>}
                  </div>
                  <div className="md:col-span-1 p-6">
                    {rates &&
                      <Card className="w-full max-w-md mx-auto">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl font-semibold">Submission Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Total Submissions</span>
                              <span className="text-2xl font-bold">{rates.mainTotal.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-border" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Rate</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm text-muted-foreground">{rates.mainCount.toLocaleString()} accepted</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    }
                  </div>
                </div>
                <div className="mt-6">
                  <Tabs tabs={tabs} defaultTab={0} />
                </div>
              </div>
            </div>
          </main >
          <FooterSection />
        </div >}
      {isAuthenticated &&
        <>
          <EditProfileDialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen} onSubmit={handleEditProfile} profile={profile} setProfile={setProfile} />
          <ChangePasswordDialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen} onSubmit={handleChangePassword} />
        </>
      }
    </>
  )
}