"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiKeySetupNotice } from "@/components/ApiKeySetupNotice";
import {
  apiJson,
  apiErrorMessage,
  looksLikeApiKeyErrorMessage,
} from "@/lib/api";
import {
  clearAuthSession,
  getAccessToken,
  getUserSnapshot,
  mergeUserSnapshot,
  UserSnapshot,
} from "@/lib/auth-storage";

type ProfilePayload = {
  email?: string;
  display_name?: string | null;
  dob?: string | null;
  profile_picture_url?: string | null;
};

function isUnauthorized(ex: unknown): boolean {
  return (ex as Error & { status?: number }).status === 401;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sessionOk, setSessionOk] = useState(false);
  const [snapshot, setSnapshot] = useState<UserSnapshot | null>(null);

  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = getAccessToken();
    if (!t) {
      router.replace(`/login?next=${encodeURIComponent("/profile")}`);
      return;
    }
    setSessionOk(true);
    setSnapshot(getUserSnapshot());
    requestAnimationFrame(() => setMounted(true));
  }, [router]);

  const handleAuthFailure = useCallback(() => {
    clearAuthSession();
    router.replace(`/login?next=${encodeURIComponent("/profile")}`);
  }, [router]);

  const loadProfile = useCallback(async () => {
    const t = getAccessToken();
    if (!t) {
      handleAuthFailure();
      return;
    }
    setProfileErr(null);
    setLoadingProfile(true);
    try {
      const res = (await apiJson("/users/profile-data", {
        method: "GET",
        auth: t,
      })) as ProfilePayload;
      setProfile(res);
      setEditName(res.display_name?.trim() || "");
      setEditDob(res.dob ? String(res.dob).slice(0, 10) : "");
      mergeUserSnapshot({
        display_name: res.display_name ?? null,
        profile_image_url: res.profile_picture_url ?? null,
      });
      setSnapshot(getUserSnapshot());
    } catch (ex) {
      if (isUnauthorized(ex)) {
        handleAuthFailure();
        return;
      }
      setProfileErr(apiErrorMessage(ex));
    } finally {
      setLoadingProfile(false);
    }
  }, [handleAuthFailure]);

  useEffect(() => {
    if (sessionOk) {
      void loadProfile();
    }
  }, [sessionOk, loadProfile]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSaveOk(null);
  }

  function handleAvatarClick() {
    fileRef.current?.click();
  }

  function handleCancel() {
    setEditName(profile?.display_name?.trim() || "");
    setEditDob(profile?.dob ? String(profile.dob).slice(0, 10) : "");
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSaveErr(null);
    setSaveOk(null);
  }

  const hasChanges =
    editName.trim() !== (profile?.display_name?.trim() || "") ||
    editDob !== (profile?.dob ? String(profile.dob).slice(0, 10) : "") ||
    selectedFile !== null;

  async function onSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveErr(null);
    setSaveOk(null);
    const t = getAccessToken();
    if (!t) {
      handleAuthFailure();
      return;
    }

    const fd = new FormData();
    if (editName.trim()) {
      fd.append("display_name", editName.trim());
    }
    if (editDob) {
      fd.append("dob", editDob);
    }
    if (selectedFile) {
      fd.append("profile_picture", selectedFile);
    }

    setSaveBusy(true);
    try {
      const res = (await apiJson("/users/update-profile", {
        method: "PATCH",
        body: fd,
        auth: t,
      })) as ProfilePayload;
      setProfile(res);
      setEditName(res.display_name?.trim() || "");
      setEditDob(res.dob ? String(res.dob).slice(0, 10) : "");
      mergeUserSnapshot({
        display_name: res.display_name ?? null,
        profile_image_url: res.profile_picture_url ?? null,
      });
      setSnapshot(getUserSnapshot());
      setSaveOk("Profile updated successfully.");
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } catch (ex) {
      if (isUnauthorized(ex)) {
        handleAuthFailure();
        return;
      }
      setSaveErr(apiErrorMessage(ex));
    } finally {
      setSaveBusy(false);
    }
  }

  if (!sessionOk) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const displayName =
    profile?.display_name ||
    snapshot?.display_name ||
    snapshot?.email?.split("@")[0] ||
    "User";
  const email = profile?.email || snapshot?.email || "";
  const avatarSrc =
    previewUrl ||
    snapshot?.profile_image_url ||
    profile?.profile_picture_url ||
    null;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className={`profile-page ${mounted ? "profile-page--visible" : ""}`}>
      <div className="profile-page__card">
        {/* Loading state */}
        {loadingProfile && !profile && !profileErr && (
          <div className="profile-page__loading">
            <span className="profile-page__loading-spinner" />
          </div>
        )}

        {/* Error */}
        {profileErr && (
          <div className="profile-page__error" role="alert">
            <p>{profileErr}</p>
            {looksLikeApiKeyErrorMessage(profileErr) && (
              <ApiKeySetupNotice scenario="backend-rejected" variant="compact" />
            )}
          </div>
        )}

        {/* Avatar section */}
        <div className="profile-page__avatar-section">
          <button
            type="button"
            className="profile-page__avatar-btn"
            onClick={handleAvatarClick}
            aria-label="Change profile photo"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="profile-page__avatar-img" />
            ) : (
              <span className="profile-page__avatar-letter">{avatarLetter}</span>
            )}
            <span className="profile-page__avatar-camera">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="profile-page__file-input"
            name="profile_picture"
          />
        </div>

        {/* User info */}
        <h1 className="profile-page__name">{displayName}</h1>
        <p className="profile-page__email">{email}</p>

        {/* Separator */}
        <div className="profile-page__divider" />

        {/* Form */}
        <form className="profile-page__form" onSubmit={onSaveProfile}>
          <div className="profile-page__field">
            <label htmlFor="profile-display-name" className="profile-page__label">
              Display Name
            </label>
            <input
              id="profile-display-name"
              name="display_name"
              type="text"
              className="profile-page__input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoComplete="name"
              placeholder="Enter your display name"
            />
          </div>

          <div className="profile-page__field">
            <label htmlFor="profile-dob" className="profile-page__label">
              Date of Birth
            </label>
            <input
              id="profile-dob"
              name="dob"
              type="date"
              className="profile-page__input"
              value={editDob}
              onChange={(e) => setEditDob(e.target.value)}
            />
          </div>

          <div className="profile-page__field">
            <label htmlFor="profile-email" className="profile-page__label">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              className="profile-page__input profile-page__input--readonly"
              value={email}
              readOnly
              tabIndex={-1}
            />
          </div>

          {/* Actions */}
          <div className="profile-page__actions">
            <button
              type="button"
              className="profile-page__cancel-btn"
              onClick={handleCancel}
              disabled={saveBusy || !hasChanges}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="profile-page__save-btn"
              disabled={saveBusy || !hasChanges}
            >
              {saveBusy ? (
                <span className="profile-page__save-spinner" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>

        {/* Feedback */}
        {saveOk && (
          <div className="profile-page__toast profile-page__toast--success" role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {saveOk}
          </div>
        )}
        {saveErr && (
          <div className="profile-page__toast profile-page__toast--error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {saveErr}
            {looksLikeApiKeyErrorMessage(saveErr) && (
              <ApiKeySetupNotice scenario="backend-rejected" variant="compact" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
