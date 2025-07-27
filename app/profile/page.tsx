"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Star, Clock, Heart, Loader2, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { profileService } from "@/lib/profile-service";
import ProfileImageUpload from "@/components/profile-image-upload";
import type { User as UserType } from "@/app/types/auth";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(authUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bio, setBio] = useState(authUser?.bio || "");
  const [originalBio, setOriginalBio] = useState(authUser?.bio || "");

  useEffect(() => {
    const loadProfile = async () => {
      if (!authUser) return;

      try {
        setIsLoading(true);
        const profileData = await profileService.getProfile();
        setUser(profileData);
        setBio(profileData.bio || "");
        setOriginalBio(profileData.bio || "");
      } catch (error) {
        console.error("Failed to load profile:", error);
        setUser(authUser);
        setBio("");
        setOriginalBio("");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [authUser, toast]);

  const handleSaveProfile = async () => {
    if (!user) return;
    if (bio === originalBio) {
      setIsEditing(false);
      return;
    }

    try {
      setIsLoading(true);
      const updatedProfile = await profileService.updateProfile({
        username: user.username,
        bio,
      });
      setUser(updatedProfile);
      setOriginalBio(bio);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated!",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpdate = (updatedUser: UserType) => {
    setUser(updatedUser);
  };

  if (isLoading && !user) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Failed to load profile data</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          {/* Profile Header */}
          <div className="text-center mb-8">
            {/* Profile Image */}
            <div className="relative inline-block mb-6">
              <ProfileImageUpload
                user={user}
                onImageUpdate={handleImageUpdate}
                className="!block"
              />
            </div>

            {/* Username and Handle */}
            <h1 className="text-3xl font-bold mb-1">{user.username}</h1>
            <p className="text-muted-foreground mb-6">@{user.username}</p>

            {/* Edit Profile Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="flex items-center gap-2 mx-auto"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>

          {/* Bio Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Bio</h2>
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBio(originalBio);
                      setIsEditing(false);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isLoading || bio === originalBio}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground leading-relaxed text-base">
                {bio || "No bio provided"}
              </p>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Currently Reading */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-3">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-500 mb-1">12</p>
                <p className="text-sm text-muted-foreground">
                  Currently Reading
                </p>
              </CardContent>
            </Card>

            {/* Completed */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-3">
                  <Star className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-500 mb-1">45</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>

            {/* Plan to Read */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-orange-500 mb-1">23</p>
                <p className="text-sm text-muted-foreground">Plan to Read</p>
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-3">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-red-500 mb-1">8</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
