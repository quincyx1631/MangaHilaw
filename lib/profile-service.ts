import axiosInstance from "./axios";
import type { User } from "@/app/types/auth";

export interface ProfileUpdateData {
  username: string;
  bio?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: User;
  };
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data: {
    avatar_url: string;
    profile: User;
  };
}

export const profileService = {
  // Get user profile
  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<ProfileResponse>("/profile");
    return response.data.data.profile;
  },

  // Update profile information
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    const response = await axiosInstance.put<ProfileResponse>("/profile", data);
    return response.data.data.profile;
  },

  // Upload profile image
  async uploadProfileImage(file: File): Promise<{ avatar_url: string; profile: User }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosInstance.post<ImageUploadResponse>(
      "/profile/upload-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data;
  },

  // Delete profile image
  async deleteProfileImage(): Promise<User> {
    const response = await axiosInstance.delete<ProfileResponse>("/profile/delete-image");
    return response.data.data.profile;
  },
}; 