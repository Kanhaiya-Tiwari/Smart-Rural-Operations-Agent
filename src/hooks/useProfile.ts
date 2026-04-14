import { useState, useEffect } from "react";
import { getAuthFromStorage } from "@/hooks/useAuth";
import { serviceUrl } from "@/lib/api";

export type UserLanguage = "en" | "hi";

export interface NotificationSettings {
  inApp: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface ProfileData {
  userId: string;
  name: string;
  location: string;
  crops: string[];
  landArea: string;
  phone: string;
  language: UserLanguage;
  notificationSettings: NotificationSettings;
  privacy: {
    shareDataForInsights: boolean;
    allowPersonalizedAi: boolean;
  };
}

const DEFAULT_PROFILE = (userId: string, name: string): ProfileData => ({
  userId,
  name,
  location: "",
  crops: [],
  landArea: "",
  phone: "",
  language: "en",
  notificationSettings: {
    inApp: true,
    sms: false,
    whatsapp: false,
  },
  privacy: {
    shareDataForInsights: true,
    allowPersonalizedAi: true,
  },
});

const STORAGE_KEY = "sroa-profile";
const PROFILE_API = serviceUrl(8093);

export function useProfile() {
  const auth = getAuthFromStorage();
  const userId = auth?.userId || "";
  const userName = auth?.name || "";

  const [profile, setProfile] = useState<ProfileData>(() => {
    if (!userId) {
      return DEFAULT_PROFILE("", "");
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return DEFAULT_PROFILE(userId, userName);
      }

      const parsed = JSON.parse(stored) as ProfileData;
      if (parsed.userId !== userId) {
        return DEFAULT_PROFILE(userId, userName);
      }

      return {
        ...parsed,
        name: parsed.name || userName,
        privacy: parsed.privacy || {
          shareDataForInsights: true,
          allowPersonalizedAi: true,
        },
      };
    } catch {
      return DEFAULT_PROFILE(userId, userName);
    }
  });

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      try {
        const resp = await fetch(`${PROFILE_API}/profile/${userId}`);
        if (!resp.ok) return;
        const data = (await resp.json()) as {
          user_id: string;
          location: string;
          crops: string[];
          language: UserLanguage;
          notification_settings: { in_app: boolean; sms: boolean; whatsapp: boolean };
          privacy?: { share_data_for_insights?: boolean; allow_personalized_ai?: boolean };
          phone?: string;
        };

        setProfile((prev) => ({
          ...prev,
          userId: data.user_id,
          name: userName || prev.name,
          location: data.location || "",
          crops: data.crops || [],
          language: data.language || "en",
          phone: data.phone || "",
          notificationSettings: {
            inApp: !!data.notification_settings?.in_app,
            sms: !!data.notification_settings?.sms,
            whatsapp: !!data.notification_settings?.whatsapp,
          },
          privacy: {
            shareDataForInsights: data.privacy?.share_data_for_insights ?? prev.privacy.shareDataForInsights,
            allowPersonalizedAi: data.privacy?.allow_personalized_ai ?? prev.privacy.allowPersonalizedAi,
          },
        }));
      } catch {
        // keep local state if profile service is unavailable
      }
    };

    loadProfile();
  }, [userId, userName]);

  useEffect(() => {
    if (!profile.userId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    // Best-effort profile sync with the profile microservice.
    const syncProfile = async () => {
      if (!profile.userId || !profile.location) return;

      try {
        await fetch(`${PROFILE_API}/profile/${profile.userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: profile.userId,
            location: profile.location,
            crops: profile.crops,
            language: profile.language,
            notification_settings: {
              in_app: profile.notificationSettings.inApp,
              sms: profile.notificationSettings.sms,
              whatsapp: profile.notificationSettings.whatsapp,
            },
            privacy: {
              share_data_for_insights: profile.privacy.shareDataForInsights,
              allow_personalized_ai: profile.privacy.allowPersonalizedAi,
            },
            phone: profile.phone,
            whatsapp_number: profile.phone,
          }),
        });
      } catch {
        // Ignore network errors so the UI works offline.
      }
    };

    syncProfile();
  }, [profile]);

  const updateProfile = (data: ProfileData) => {
    setProfile(data);
  };

  return { profile, updateProfile };
}
