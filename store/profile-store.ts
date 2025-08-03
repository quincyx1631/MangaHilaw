import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { profileService, type ProfileUpdateData } from '@/lib/profile-service';
import type { User } from '@/app/types/auth';

interface ProfileStats {
  currentlyReading: number;
  completed: number;
  planToRead: number;
  favorites: number;
}

interface ProfileState {
  // Profile data
  user: User | null;
  originalBio: string;
  bio: string;
  stats: ProfileStats;
  currentUserId: string | null; // Add this to track current user
  
  // Cache state
  lastFetchTime: number | null;
  cacheHits: number;
  apiCallCount: number;
  
  // Actions
  setUser: (user: User | null) => void;
  setBio: (bio: string) => void;
  setOriginalBio: (bio: string) => void;
  setStats: (stats: Partial<ProfileStats>) => void;
  
  // API Actions
  loadProfile: (authUser?: User | null, forceRefresh?: boolean) => Promise<User | null>;
  updateProfile: (data: ProfileUpdateData) => Promise<User | null>;
  uploadProfileImage: (file: File) => Promise<{ avatar_url: string; profile: User } | null>;
  deleteProfileImage: () => Promise<User | null>;
  
  // Utility actions
  resetEditState: () => void;
  initializeFromAuth: (authUser: User | null) => void;
  clearProfile: () => void;
  
  // Stats
  getStats: () => {
    totalApiCalls: number;
    cacheHitRate: string;
    lastFetched: string;
  };
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        originalBio: "",
        bio: "",
        currentUserId: null,
        stats: {
          currentlyReading: 0,
          completed: 0,
          planToRead: 0,
          favorites: 0,
        },
        
        lastFetchTime: null,
        cacheHits: 0,
        apiCallCount: 0,
        
        setUser: (user) => set({ 
          user,
          currentUserId: user?.id || null
        }, false, 'setUser'),
        
        setBio: (bio) => set({ bio }, false, 'setBio'),
        setOriginalBio: (originalBio) => set({ originalBio }, false, 'setOriginalBio'),
        setStats: (newStats) => {
          const { stats } = get();
          set({ stats: { ...stats, ...newStats } }, false, 'setStats');
        },
        
        loadProfile: async (authUser, forceRefresh = false) => {
          const { user, lastFetchTime, cacheHits, apiCallCount, currentUserId } = get();
          if (authUser && currentUserId && authUser.id !== currentUserId) {
            console.log("🔄 [Profile] Different user detected, clearing cache");
            set({
              user: null,
              bio: "",
              originalBio: "",
              lastFetchTime: null,
              currentUserId: authUser.id,
              stats: {
                currentlyReading: 0,
                completed: 0,
                planToRead: 0,
                favorites: 0,
              }
            }, false, 'loadProfile/userChanged');
          }
          
          const now = Date.now();
          const cacheValidTime = 30 * 60 * 1000; 
          const hasCachedData = user !== null && user.id === authUser?.id;
          const isCacheValid = lastFetchTime && (now - lastFetchTime) < cacheValidTime;
          
          if (hasCachedData && isCacheValid && !forceRefresh) {
            console.log("📋 [Cache] Using cached profile data");
            set({ 
              cacheHits: cacheHits + 1
            }, false, 'loadProfile/cacheHit');
            return user;
          }
          
          if (!authUser) {
            console.log("⚠️ [Profile] No auth user provided");
            set({ 
              user: null, 
              bio: "", 
              originalBio: "",
              currentUserId: null
            }, false, 'loadProfile/noAuthUser');
            return null;
          }
          
          try {
            console.log("🚀 [API] Fetching profile data...");
            const profileData = await profileService.getProfile();
            console.log("✅ [API] Profile data loaded successfully:", profileData.username);
            
            const bio = profileData.bio || "";
            set({ 
              user: profileData,
              bio,
              originalBio: bio,
              currentUserId: profileData.id,
              apiCallCount: apiCallCount + 1,
              lastFetchTime: now
            }, false, 'loadProfile/success');
            
            return profileData;
            
          } catch (error) {
            console.error("❌ [API] Error fetching profile:", error);
            const bio = authUser.bio || "";
            set({ 
              user: authUser,
              bio,
              originalBio: bio,
              currentUserId: authUser.id
            }, false, 'loadProfile/fallback');
            
            return authUser;
          }
        },
        
        updateProfile: async (data: ProfileUpdateData) => {
          const { user, apiCallCount } = get();
          if (!user) {
            console.error("❌ [Profile] No user data available");
            return null;
          }
          
          try {
            console.log("🔄 [API] Updating profile...", data);
            const updatedProfile = await profileService.updateProfile(data);
            console.log("✅ [API] Profile updated successfully");
            
            const bio = updatedProfile.bio || "";
            set({ 
              user: updatedProfile,
              bio,
              originalBio: bio,
              currentUserId: updatedProfile.id,
              apiCallCount: apiCallCount + 1,
              lastFetchTime: Date.now()
            }, false, 'updateProfile/success');
            
            return updatedProfile;
            
          } catch (error) {
            console.error("❌ [API] Error updating profile:", error);
            return null;
          }
        },
        
        uploadProfileImage: async (file: File) => {
          const { apiCallCount } = get();
          
          try {
            console.log("📤 [API] Uploading profile image...");
            const result = await profileService.uploadProfileImage(file);
            console.log("✅ [API] Profile image uploaded successfully");
            
            const bio = result.profile.bio || "";
            set({ 
              user: result.profile,
              bio,
              originalBio: bio,
              currentUserId: result.profile.id,
              apiCallCount: apiCallCount + 1,
              lastFetchTime: Date.now()
            }, false, 'uploadProfileImage/success');
            
            return result;
            
          } catch (error) {
            console.error("❌ [API] Error uploading profile image:", error);
            return null;
          }
        },
        
        deleteProfileImage: async () => {
          const { apiCallCount } = get();
          
          try {
            console.log("🗑️ [API] Deleting profile image...");
            const updatedProfile = await profileService.deleteProfileImage();
            console.log("✅ [API] Profile image deleted successfully");
            
            const bio = updatedProfile.bio || "";
            set({ 
              user: updatedProfile,
              bio,
              originalBio: bio,
              currentUserId: updatedProfile.id,
              apiCallCount: apiCallCount + 1,
              lastFetchTime: Date.now()
            }, false, 'deleteProfileImage/success');
            
            return updatedProfile;
            
          } catch (error) {
            console.error("❌ [API] Error deleting profile image:", error);
            return null;
          }
        },
        
        resetEditState: () => {
          const { originalBio } = get();
          set({ 
            bio: originalBio
          }, false, 'resetEditState');
        },
        
        initializeFromAuth: (authUser: User | null) => {
          const { currentUserId } = get();
          
          if (!authUser) {
            set({ 
              user: null, 
              bio: "", 
              originalBio: "",
              currentUserId: null,
              lastFetchTime: null,
              stats: {
                currentlyReading: 0,
                completed: 0,
                planToRead: 0,
                favorites: 0,
              }
            }, false, 'initializeFromAuth/null');
            return;
          }
          
          if (currentUserId && authUser.id !== currentUserId) {
            console.log("🔄 [Profile] User changed, clearing profile data");
            const bio = authUser.bio || "";
            set({ 
              user: authUser,
              bio,
              originalBio: bio,
              currentUserId: authUser.id,
              lastFetchTime: null,
              stats: {
                currentlyReading: 0,
                completed: 0,
                planToRead: 0,
                favorites: 0,
              }
            }, false, 'initializeFromAuth/userChanged');
            return;
          }
          
          const bio = authUser.bio || "";
          set({ 
            user: authUser,
            bio,
            originalBio: bio,
            currentUserId: authUser.id
          }, false, 'initializeFromAuth');
        },
        
        clearProfile: () => {
          console.log("🧹 [Profile] Clearing profile data");
          set({
            user: null,
            bio: "",
            originalBio: "",
            currentUserId: null,
            lastFetchTime: null,
            stats: {
              currentlyReading: 0,
              completed: 0,
              planToRead: 0,
              favorites: 0,
            }
          }, false, 'clearProfile');
        },
        
        // Stats
        getStats: () => {
          const { apiCallCount, cacheHits, lastFetchTime } = get();
          const totalRequests = apiCallCount + cacheHits;
          
          return {
            totalApiCalls: apiCallCount,
            cacheHitRate: totalRequests > 0 ? `${Math.round((cacheHits / totalRequests) * 100)}%` : '0%',
            lastFetched: lastFetchTime 
              ? new Date(lastFetchTime).toLocaleTimeString()
              : 'Never',
          };
        },
      }),
      {
        name: 'profile-storage', 
        partialize: (state: ProfileState) => ({
          user: state.user,
          bio: state.bio,
          originalBio: state.originalBio,
          stats: state.stats,
          currentUserId: state.currentUserId,
          lastFetchTime: state.lastFetchTime,
          cacheHits: state.cacheHits,
          apiCallCount: state.apiCallCount,
        }),
      }
    ),
    {
      name: 'profile-store',
    }
  )
);
