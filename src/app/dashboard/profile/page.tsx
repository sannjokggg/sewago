"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthPopup from "@/components/AuthPopup";

interface UserProfile {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  dob: string;
  address: string;
  id_card_url: string;
  profile_photo: string;
  role: string;
  verification_status: string;
  is_verified: boolean;
  verified_at: string;
  created_at: string;
}

interface UserPost {
  id: number;
  title: string;
  description: string;
  type: string;
  price: string;
  category: string;
  image_url: string;
  images: string[];
  is_published: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      setShowAuth(true);
    }
  }, [status]);

  const user = profile || session?.user;
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/user/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setPostsLoading(false);
      })
      .catch(() => setPostsLoading(false));
  }, []);

  if (status === "unauthenticated") {
    return (
      <>
        <AuthPopup
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          redirectTo="/dashboard/profile"
        />
        <div className="flex items-center justify-center min-h-[80vh]">
          <p className="text-text-muted text-sm">Please sign in to view your profile.</p>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 py-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-normal text-text-primary">Profile</h1>
        <p className="text-sm sm:text-lg text-text-secondary">Manage your account settings.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        {/* Left Card - Avatar & Basic Info */}
        <div className="w-full sm:w-[350px] flex flex-col items-center rounded-[20px] sm:rounded-[24px] bg-surface p-5 sm:p-6 shadow-sm">
          {profile?.profile_photo ? (
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden">
              <Image
                src={profile.profile_photo}
                alt={profile.name || "Profile"}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gray-300 text-2xl sm:text-3xl font-medium text-white">
              {initial}
            </div>
          )}
          <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold text-text-primary">
            {user?.name || "User"}
          </h2>
          <p className="text-xs sm:text-sm text-text-muted">{user?.email || ""}</p>

          {profile?.is_verified && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          )}
          {profile && !profile.is_verified && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
              {profile.verification_status === "rejected" ? "Rejected" : "Pending Verification"}
            </span>
          )}

          <div className="mt-4 w-full space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Role</span>
              <span className="font-medium text-text-primary capitalize">{profile?.role || "User"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Member Since</span>
              <span className="font-medium text-text-primary">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Details */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-5">
          {/* Personal Information */}
          <div className="rounded-[20px] sm:rounded-[24px] bg-surface p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary">Personal Information</h3>
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="mb-1 block text-sm sm:text-base font-medium text-text-muted">First Name</label>
                <input
                  type="text"
                  defaultValue={profile?.first_name || ""}
                  readOnly
                  className="w-full rounded-full border border-border-default px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none bg-gray-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm sm:text-base font-medium text-text-muted">Last Name</label>
                <input
                  type="text"
                  defaultValue={profile?.last_name || ""}
                  readOnly
                  className="w-full rounded-full border border-border-default px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none bg-gray-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm sm:text-base font-medium text-text-muted">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || ""}
                  readOnly
                  className="w-full rounded-full border border-border-default px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none bg-gray-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm sm:text-base font-medium text-text-muted">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  readOnly
                  className="w-full rounded-full border border-border-default px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none bg-gray-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm sm:text-base font-medium text-text-muted">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={profile?.phone_number || ""}
                  placeholder="Not set"
                  readOnly
                  className="w-full rounded-full border border-border-default px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none placeholder:text-[#B0B0B0] bg-gray-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm sm:text-base font-medium text-text-muted">Date of Birth</label>
                <input
                  type="text"
                  defaultValue={profile?.dob ? new Date(profile.dob).toLocaleDateString() : ""}
                  placeholder="Not set"
                  readOnly
                  className="w-full rounded-full border border-border-default px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none placeholder:text-[#B0B0B0] bg-gray-50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm sm:text-base font-medium text-text-muted">Address</label>
                <input
                  type="text"
                  defaultValue={profile?.address || ""}
                  placeholder="Not set"
                  readOnly
                  className="w-full rounded-full border border-border-default px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none placeholder:text-[#B0B0B0] bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Verification & Documents */}
          <div className="rounded-[20px] sm:rounded-[24px] bg-surface p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary">Verification & Documents</h3>
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="mb-1 block text-sm sm:text-base font-medium text-text-muted">Verification Status</label>
                <div className="w-full rounded-full border border-border-default px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50">
                  <span className={`font-medium ${
                    profile?.verification_status === "verified"
                      ? "text-green-600"
                      : profile?.verification_status === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}>
                    {profile?.verification_status?.charAt(0).toUpperCase() + (profile?.verification_status?.slice(1) || "Pending") || "Pending"}
                  </span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm sm:text-base font-medium text-text-muted">Verified At</label>
                <input
                  type="text"
                  defaultValue={profile?.verified_at ? new Date(profile.verified_at).toLocaleString() : ""}
                  placeholder="Not verified yet"
                  readOnly
                  className="w-full rounded-full border border-border-default px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none placeholder:text-[#B0B0B0] bg-gray-50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm sm:text-base font-medium text-text-muted">ID Card</label>
                {profile?.id_card_url ? (
                  <a
                    href={profile.id_card_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm sm:text-base text-blue-600 hover:underline"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View ID Document
                  </a>
                ) : (
                  <input
                    type="text"
                    placeholder="No ID card uploaded"
                    readOnly
                    className="w-full rounded-full border border-border-default px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none placeholder:text-[#B0B0B0] bg-gray-50"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Uploaded Posts / Cards */}
          <div className="rounded-[20px] sm:rounded-[24px] bg-surface p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary">
              My Posts & Cards
              <span className="ml-2 text-sm font-normal text-text-muted">({posts.length})</span>
            </h3>
            {postsLoading ? (
              <div className="mt-4 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              </div>
            ) : posts.length === 0 ? (
              <div className="mt-4 text-center text-sm text-text-muted py-8">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="mt-2">No posts or cards uploaded yet.</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-[16px] border border-border-default bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Post Image */}
                    <div className="relative h-40 w-full bg-gray-100">
                      {post.images && post.images.length > 0 ? (
                        <Image
                          src={post.images[0]}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white capitalize">
                        {post.type}
                      </span>
                      {!post.is_published && (
                        <span className="absolute top-2 right-2 rounded-full bg-yellow-500/90 px-3 py-1 text-xs font-medium text-white">
                          Unpublished
                        </span>
                      )}
                    </div>

                    {/* Post Info */}
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-text-primary truncate">{post.title}</h4>
                      <p className="mt-1 text-xs text-text-muted line-clamp-2">{post.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        {post.category && (
                          <span className="text-xs text-text-muted bg-gray-100 rounded-full px-2 py-0.5">{post.category}</span>
                        )}
                        {post.price && (
                          <span className="text-sm font-semibold text-text-primary">{post.price}</span>
                        )}
                      </div>
                      <p className="mt-2 text-[10px] text-text-muted">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
