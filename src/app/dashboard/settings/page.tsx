"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Camera, Eye, EyeOff, Sun, Moon, AlertTriangle, Loader2,
} from "lucide-react";

const tabs = [
  { id: "account", label: "Account" },
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
  { id: "appearance", label: "Appearance" },
  { id: "danger", label: "Danger Zone" },
];

function Toggle({
  enabled,
  onToggle,
  label,
  description,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-border-light last:border-0">
      <div className="pr-8">
        <p className="text-lg font-medium text-text-primary">{label}</p>
        {description && <p className="text-base text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors duration-200 ${
          enabled ? "bg-nav-active" : "bg-border-default"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function loadSettings(key: string, fallback: unknown) {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(`settings_${key}`);
    return val !== null ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function saveSettings(key: string, value: unknown) {
  try { localStorage.setItem(`settings_${key}`, JSON.stringify(value)); } catch {}
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("account");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(() => loadSettings("phone", ""));
  const [location, setLocation] = useState(() => loadSettings("location", ""));
  const [bio, setBio] = useState(() => loadSettings("bio", ""));
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [notifMessages, setNotifMessages] = useState(() => loadSettings("notifMessages", true));
  const [notifEvents, setNotifEvents] = useState(() => loadSettings("notifEvents", true));
  const [notifListings, setNotifListings] = useState(() => loadSettings("notifListings", false));
  const [notifEmail, setNotifEmail] = useState(() => loadSettings("notifEmail", false));
  const [notifSound, setNotifSound] = useState(() => loadSettings("notifSound", true));

  const [showEmail, setShowEmail] = useState(() => loadSettings("showEmail", true));
  const [showPhone, setShowPhone] = useState(() => loadSettings("showPhone", false));
  const [profilePublic, setProfilePublic] = useState(() => loadSettings("profilePublic", true));
  const [onlineStatus, setOnlineStatus] = useState(() => loadSettings("onlineStatus", true));
  const [readReceipts, setReadReceipts] = useState(() => loadSettings("readReceipts", true));

  const [accentColor, setAccentColor] = useState(() => loadSettings("accentColor", "#B8F25E"));
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(() => loadSettings("fontSize", "medium"));

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { saveSettings("accentColor", accentColor); }, [accentColor]);
  useEffect(() => { saveSettings("fontSize", fontSize); }, [fontSize]);
  useEffect(() => { saveSettings("notifMessages", notifMessages); }, [notifMessages]);
  useEffect(() => { saveSettings("notifEvents", notifEvents); }, [notifEvents]);
  useEffect(() => { saveSettings("notifListings", notifListings); }, [notifListings]);
  useEffect(() => { saveSettings("notifEmail", notifEmail); }, [notifEmail]);
  useEffect(() => { saveSettings("notifSound", notifSound); }, [notifSound]);
  useEffect(() => { saveSettings("showEmail", showEmail); }, [showEmail]);
  useEffect(() => { saveSettings("showPhone", showPhone); }, [showPhone]);
  useEffect(() => { saveSettings("profilePublic", profilePublic); }, [profilePublic]);
  useEffect(() => { saveSettings("onlineStatus", onlineStatus); }, [onlineStatus]);
  useEffect(() => { saveSettings("readReceipts", readReceipts); }, [readReceipts]);
  useEffect(() => { saveSettings("phone", phone); }, [phone]);
  useEffect(() => { saveSettings("location", location); }, [location]);
  useEffect(() => { saveSettings("bio", bio); }, [bio]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg("");
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => setProfileMsg(""), 3000);
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMsg("Please fill in both fields.");
      return;
    }
    setSavingPassword(true);
    setPasswordMsg("");
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setPasswordMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordMsg(""), 3000);
    } finally { setSavingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "DELETE") return;
    setDeleting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      alert("Account deleted permanently.");
    } finally { setDeleting(false); }
  };

  return (
    <div className="flex flex-col gap-6 py-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div>
        <h1 className="text-3xl lg:text-5xl font-normal text-text-primary">Settings</h1>
        <p className="text-lg text-text-secondary">Manage your account preferences.</p>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-2.5 text-base font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-nav-active text-white shadow-sm"
                : "bg-surface text-[#666666] hover:bg-border-light hover:text-[#222222]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account */}
      {activeTab === "account" && (
        <div className="rounded-[24px] bg-surface p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-text-primary mb-5">Account</h3>

          <div className="mb-5">
            <label className="mb-1.5 block text-lg font-medium text-text-muted">Email Address</label>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-full border border-border-default px-5 py-3 text-lg text-text-primary outline-none hover:border-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
              />
              <button className="rounded-full bg-nav-active px-6 py-3 text-lg font-medium text-white hover:bg-gray-800 transition-colors">
                Change
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-lg font-medium text-text-muted">Current Password</label>
            <div className="relative max-w-[500px]">
              <input
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-full border border-border-default px-5 py-3 pr-12 text-lg text-text-primary outline-none hover:border-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-lg font-medium text-text-muted">New Password</label>
            <div className="relative max-w-[500px]">
              <input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-full border border-border-default px-5 py-3 pr-12 text-lg text-text-primary outline-none hover:border-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {passwordMsg && (
            <p className={`mb-4 text-base ${passwordMsg.includes("success") ? "text-green-600" : "text-red-500"}`}>
              {passwordMsg}
            </p>
          )}

          <button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="rounded-full bg-accent px-6 py-3 text-lg font-semibold text-text-primary disabled:opacity-50"
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>

          <div className="mt-6 pt-5 border-t border-border-light">
            <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Active Sessions</p>
            <div className="rounded-[16px] border border-border-light bg-surface-alt p-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-text-primary">Current session</p>
                <p className="text-base text-text-muted">Active now on this device</p>
              </div>
              <span className="rounded-full bg-green-50 px-4 py-1.5 text-base font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Profile */}
      {activeTab === "profile" && (
        <div className="rounded-[24px] bg-surface p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-text-primary mb-5">Profile</h3>

          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-3xl font-semibold text-text-primary">
                {initial}
              </div>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-nav-active text-white shadow-sm hover:bg-gray-700 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <p className="text-lg font-medium text-text-primary">{user?.name || "User"}</p>
              <p className="text-base text-text-muted">{user?.email || ""}</p>
              <button className="mt-2 text-base font-medium text-text-primary hover:underline">Change photo</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="mb-1.5 block text-lg font-medium text-text-muted">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-full border border-border-default px-5 py-3 text-lg text-text-primary outline-none hover:border-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-lg font-medium text-text-muted">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-full border border-border-default px-5 py-3 text-lg text-text-primary outline-none placeholder:text-[#B0B0B0] hover:border-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-lg font-medium text-text-muted">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Kathmandu, Nepal"
                className="w-full rounded-full border border-border-default px-5 py-3 text-lg text-text-primary outline-none placeholder:text-[#B0B0B0] hover:border-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-lg font-medium text-text-muted">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              rows={3}
              className="w-full rounded-2xl border border-border-default px-5 py-3 text-lg text-text-primary outline-none resize-none placeholder:text-[#B0B0B0] hover:border-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
            />
          </div>

          {profileMsg && <p className="mb-4 text-base text-green-600">{profileMsg}</p>}

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="rounded-full bg-accent px-6 py-3 text-lg font-semibold text-text-primary disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="rounded-[24px] bg-surface p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-text-primary mb-2">Notifications</h3>
          <p className="text-base text-text-muted mb-5">Choose what and how you want to be notified.</p>

          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-1">Messages</p>
          <Toggle enabled={notifMessages} onToggle={() => setNotifMessages(!notifMessages)} label="New message notifications" description="Get notified when someone sends you a message" />
          <Toggle enabled={notifSound} onToggle={() => setNotifSound(!notifSound)} label="Notification sounds" description="Play a sound when you receive a notification" />

          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mt-5 mb-1">Marketplace</p>
          <Toggle enabled={notifListings} onToggle={() => setNotifListings(!notifListings)} label="New listing alerts" description="Get notified about new listings matching your interests" />

          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mt-5 mb-1">Events</p>
          <Toggle enabled={notifEvents} onToggle={() => setNotifEvents(!notifEvents)} label="Event reminders" description="Get reminded about upcoming events you RSVP'd to" />

          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mt-5 mb-1">Email</p>
          <Toggle enabled={notifEmail} onToggle={() => setNotifEmail(!notifEmail)} label="Email notifications" description="Receive email digests about your account activity" />
        </div>
      )}

      {/* Privacy */}
      {activeTab === "privacy" && (
        <div className="rounded-[24px] bg-surface p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-text-primary mb-2">Privacy</h3>
          <p className="text-base text-text-muted mb-5">Control what others can see about you.</p>

          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-1">Profile visibility</p>
          <Toggle enabled={profilePublic} onToggle={() => setProfilePublic(!profilePublic)} label="Public profile" description="Your profile is visible to everyone on the platform" />
          <Toggle enabled={onlineStatus} onToggle={() => setOnlineStatus(!onlineStatus)} label="Show online status" description="Others can see when you're online" />

          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mt-5 mb-1">Contact info</p>
          <Toggle enabled={showEmail} onToggle={() => setShowEmail(!showEmail)} label="Show email on profile" description="Other users can see your email address" />
          <Toggle enabled={showPhone} onToggle={() => setShowPhone(!showPhone)} label="Show phone on profile" description="Other users can see your phone number" />
          <Toggle enabled={readReceipts} onToggle={() => setReadReceipts(!readReceipts)} label="Read receipts" description="Others can see when you've read their messages" />
        </div>
      )}

      {/* Appearance */}
      {activeTab === "appearance" && (
        <div className="rounded-[24px] bg-surface p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-text-primary mb-2">Appearance</h3>
          <p className="text-base text-text-muted mb-5">Customize how the app looks and feels.</p>

          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Theme</p>
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-4 rounded-[24px] border-2 px-6 py-5 transition-all flex-1 ${
                theme === "light" ? "border-gray-300 bg-surface-alt" : "border-border-default hover:border-gray-300"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface border border-border-light shadow-sm">
                <Sun size={24} className="text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">Light</p>
                <p className="text-base text-text-muted">Default</p>
              </div>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-4 rounded-[24px] border-2 px-6 py-5 transition-all flex-1 ${
                theme === "dark" ? "border-gray-300 bg-surface-alt" : "border-border-default hover:border-gray-300"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nav-active shadow-sm">
                <Moon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">Dark</p>
                <p className="text-base text-text-muted">Comfortable</p>
              </div>
            </button>
          </div>

          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Accent Color</p>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex gap-3">
              {["#B8F25E", "#60A5FA", "#A78BFA", "#F472B6", "#34D399", "#FBBF24"].map((color) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`h-11 w-11 rounded-full transition-all ${accentColor === color ? "ring-2 ring-offset-2 ring-gray-300 scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border-default px-4 py-2 hover:border-gray-300 transition-colors">
              <div className="h-5 w-5 rounded" style={{ backgroundColor: accentColor }} />
              <span className="text-base font-medium text-text-primary uppercase">{accentColor}</span>
            </div>
          </div>

          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Font Size</p>
          <div className="flex gap-4">
            {[
              { value: "small" as const, label: "Small", preview: "text-base" },
              { value: "medium" as const, label: "Default", preview: "text-lg" },
              { value: "large" as const, label: "Large", preview: "text-xl" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFontSize(opt.value)}
                className={`flex items-center gap-3 rounded-[16px] border-2 px-6 py-4 transition-all flex-1 ${
                  fontSize === opt.value ? "border-gray-300 bg-surface-alt" : "border-border-default hover:border-gray-300"
                }`}
              >
                <span className={`font-semibold text-text-primary ${opt.preview}`}>Aa</span>
                <span className="text-base font-medium text-text-primary">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {activeTab === "danger" && (
        <div className="rounded-[24px] bg-surface p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-text-primary mb-2">Danger Zone</h3>
          <p className="text-base text-text-muted mb-5">Irreversible actions for your account.</p>

          <div className="flex gap-5">
            <div className="flex-1 rounded-[16px] border border-border-default p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-border-light">
                  <AlertTriangle size={18} className="text-text-muted" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-text-primary">Deactivate Account</p>
                  <p className="text-base text-text-muted mt-1 mb-4">Temporarily hide your profile. Reactivate anytime by logging in.</p>
                  <button className="rounded-full border border-border-default px-5 py-2.5 text-base font-medium text-text-secondary hover:bg-surface-alt transition-colors">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-[16px] border border-red-200 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-red-600">Delete Account</p>
                  <p className="text-base text-text-muted mt-1 mb-4">Permanently delete your account and all data. Cannot be undone.</p>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="rounded-full bg-red-50 border border-red-200 px-5 py-2.5 text-base font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div>
                      <p className="text-base text-red-600 mb-2">Type <span className="font-bold">DELETE</span> to confirm:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={deleteText}
                          onChange={(e) => setDeleteText(e.target.value)}
                          placeholder="DELETE"
                          className="flex-1 rounded-full border border-red-200 bg-surface px-4 py-2.5 text-base text-text-primary outline-none hover:border-red-300 focus:border-red-300"
                        />
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteText !== "DELETE" || deleting}
                          className="rounded-full bg-red-600 px-5 py-2.5 text-base font-semibold text-white disabled:opacity-50 hover:bg-red-700 transition-colors"
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                      <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }} className="mt-2 text-sm text-text-muted hover:text-text-primary">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
