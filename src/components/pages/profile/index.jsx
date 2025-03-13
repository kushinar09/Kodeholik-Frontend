"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, User, Edit, KeyRound } from "lucide-react"
import FooterSection from "@/components/common/shared/footer";
import HeaderSection from "@/components/common/shared/header";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react"
import { changePassword, editProfile, getUserProfile } from "../../../lib/api/user_api";
import { useAuth } from "@/providers/AuthProvider"
import { EditProfileDialog } from "./edit";
import LoadingScreen from "@/components/common/shared/other/loading";
import { toast } from "@/hooks/use-toast";
import { ChangePasswordDialog } from "./change-password";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const { apiCall } = useAuth()
    const { isAuthenticated, user, logout } = useAuth()
    const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
    const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
    const [profile, setProfile] = useState({
        avatarFile: null,
        avatarImg: "",
        username: "",
        fullname: ""
    })

    const fetchCurrentUserProfile = async () => {
        try {
            setIsLoading(true);
            const data = await getUserProfile(apiCall);
            console.log(data);
            setCurrentUser(data);
            setProfile({
                avatarFile: null,
                avatarImg: data.avatar,
                username: data.username,
                fullname: data.fullname,
                email: data.email
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchCurrentUserProfile();
    }, []);

    const handleEditProfile = (profile) => {
        const formData = new FormData();
        if (profile.avatarFile != null) {
            formData.append("avatar", profile.avatarFile);
        }
        formData.append("username", profile.username);
        formData.append("fullname", profile.fullname);
        editUserProfile(formData);
    }

    const handleChangePassword = (formPassword) => {
        console.log(formPassword);
        changeUserPassword(formPassword);
    }


    const editUserProfile = async (profile) => {
        try {
            const data = await editProfile(apiCall, profile);
            console.log(data);
            setCurrentUser(data);
            setProfile({
                avatarFile: null,
                avatarImg: data.avatar,
                username: data.username,
                fullname: data.fullname
            });
        } catch (error) {
            console.log(error);
        } finally {
            toast({
                title: "Edit Profile",
                description: "Edit profile successful",
                variant: "default" // destructive
            })
            setIsEditProfileDialogOpen(false);
        }
    }

    const changeUserPassword = async (formPassword) => {
        try {
            await changePassword(apiCall, formPassword);
            toast({
                title: "Change Password",
                description: "Change password successful. Please login again",
                variant: "default" // destructive
            })
            setIsChangePasswordDialogOpen(false);
            window.location.href = "/login"
        } catch (error) {
            console.log(error);
        } finally {
        }
    }

    return (
        <>
            {isLoading && <LoadingScreen />}
            {!isLoading && <div className="min-h-screen bg-bg-primary">
                <HeaderSection />
                {/* Main Content */}
                <main className="p-4 px-24">
                    {/* Study Plan Section */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-8">
                        <div className="md:col-span-3 border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                            {currentUser != null && <Card className="p-6 md:p-8 bg-black">
                                <CardContent>
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="relative">
                                            <Avatar className="w-24 h-24 border-2 rounded-full bg-white">
                                                <AvatarImage src={currentUser.avatar} alt={name} className="object-cover" />
                                                <AvatarFallback className="text-2xl font-bold">avatar</AvatarFallback>
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
                            </Card>}
                        </div>
                        <div className="md:col-span-5 bg-black border-2 border-black rounded-lg">

                        </div>
                    </div>
                </main>
                <FooterSection />
            </div>}
            <EditProfileDialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen} onSubmit={handleEditProfile} profile={profile} setProfile={setProfile} />
            <ChangePasswordDialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen} onSubmit={handleChangePassword}  />

        </>
    );
}