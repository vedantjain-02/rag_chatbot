"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
  const [sessionOk, setSessionOk] = useState(false);
  const [snapshot, setSnapshot] = useState<UserSnapshot | null>(null);

  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  useEffect(() => {
    const t = getAccessToken();
    if (!t) {
      router.replace(`/login?next=${encodeURIComponent("/profile")}`);
      return;
    }
    setSessionOk(true);
    setSnapshot(getUserSnapshot());
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

  async function onSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveErr(null);
    setSaveOk(null);
    const t = getAccessToken();
    if (!t) {
      handleAuthFailure();
      return;
    }

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem(
      "profile_picture",
    ) as HTMLInputElement;
    const file = fileInput.files?.[0];

    const fd = new FormData();
    if (editName.trim()) {
      fd.append("display_name", editName.trim());
    }
    if (editDob) {
      fd.append("dob", editDob);
    }
    if (file) {
      fd.append("profile_picture", file);
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
      setSaveOk("Profile saved.");
      fileInput.value = "";
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
        <p>Loading…</p>
      </div>
    );
  }

  const display =
    profile?.display_name ||
    snapshot?.display_name ||
    snapshot?.email ||
    "there";

  return (
    <div className="profile-page">
      <header className="page-screen-header">
        <h1 className="page-screen-header__title">Profile</h1>
        <p className="muted">Signed in as {display}. Update your details below.</p>
        <div className="pill-row">
          <span className="pill pill-blue">JWT session</span>
          {snapshot?.roles?.length ? (
            <span className="pill pill-gray">{snapshot.roles.join(", ")}</span>
          ) : null}
        </div>
      </header>

      <div className="profile-page__grid">
        <section className="card" aria-labelledby="profile-heading">
          <div className="section-head">
            <h2 id="profile-heading">Your profile</h2>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => void loadProfile()}
              disabled={loadingProfile}
            >
              {loadingProfile ? "Loading…" : "Refresh"}
            </button>
          </div>

          {profileErr && (
            <>
              <p className="error" role="alert">
                {profileErr}
              </p>
              {looksLikeApiKeyErrorMessage(profileErr) && (
                <ApiKeySetupNotice scenario="backend-rejected" variant="compact" />
              )}
            </>
          )}

          {loadingProfile && !profile && !profileErr && (
            <p className="muted">Loading profile…</p>
          )}

          {profile && (
            <dl className="profile-dl">
              <dt>Email</dt>
              <dd>{profile.email ?? "—"}</dd>

              <dt>Display name</dt>
              <dd>{profile.display_name || "—"}</dd>

              <dt>Date of birth</dt>
              <dd>{profile.dob ?? "Not set"}</dd>

              <dt>Avatar</dt>
              <dd>
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt=""
                    className="avatar-thumb"
                    width={52}
                    height={52}
                  />
                ) : (
                  "No photo"
                )}
              </dd>
            </dl>
          )}
        </section>

        <section className="card" aria-labelledby="edit-heading">
          <h2 id="edit-heading">Edit profile</h2>
          <p className="muted">
            Saves to <code>PATCH /users/update-profile</code> on your FastAPI backend.
          </p>

          <form className="profile-edit-form" onSubmit={onSaveProfile}>
            <label htmlFor="edit-display_name">Display name</label>
            <input
              id="edit-display_name"
              name="display_name"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoComplete="name"
            />

            <label htmlFor="edit-dob">Date of birth</label>
            <input
              id="edit-dob"
              name="dob"
              type="date"
              value={editDob}
              onChange={(e) => setEditDob(e.target.value)}
            />

            <label htmlFor="edit-photo">Profile photo (JPEG, PNG, WebP)</label>
            <input
              id="edit-photo"
              name="profile_picture"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />

            <button type="submit" className="primary" disabled={saveBusy}>
              {saveBusy ? "Saving…" : "Save changes"}
            </button>
          </form>

          {saveOk && (
            <p className="notice" role="status">
              {saveOk}
            </p>
          )}
          {saveErr && (
            <>
              <p className="error" role="alert">
                {saveErr}
              </p>
              {looksLikeApiKeyErrorMessage(saveErr) && (
                <ApiKeySetupNotice scenario="backend-rejected" variant="compact" />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
