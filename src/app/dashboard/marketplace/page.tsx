"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tag, ArrowLeftRight, Gift, UserPlus, Loader2, Search, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import ImageLightbox from "@/components/image-lightbox";
import ThreeDotMenu from "@/components/three-dot-menu";
import MultiImageUploader from "@/components/multi-image-uploader";

interface Post {
  id: number;
  user_id: number;
  title: string;
  description: string;
  type: string;
  price: string | null;
  category: string | null;
  image_url: string | null;
  images: string[];
  user_name: string;
  created_at: string;
  is_available: boolean;
}

const typeConfig: Record<string, { gradient: string; badge: string; icon: typeof Tag }> = {
  Exchange: { gradient: "from-gray-50 to-gray-100", badge: "border border-gray-300 text-text-secondary", icon: ArrowLeftRight },
  Giveaway: { gradient: "from-gray-50 to-gray-100", badge: "border border-gray-300 text-text-secondary", icon: Gift },
  Request: { gradient: "from-gray-50 to-gray-100", badge: "border border-gray-300 text-text-secondary", icon: UserPlus },
};

const categories = [
  "Electronics", "Furniture", "Clothing", "Books", "Sports",
  "Home & Garden", "Vehicles", "Toys", "Other",
];

const postTypes = [
  { value: "Exchange", label: "Exchange", icon: ArrowLeftRight },
  { value: "Giveaway", label: "Giveaway", icon: Gift },
  { value: "Request", label: "Request", icon: UserPlus },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Marketplace() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editType, setEditType] = useState("Exchange");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editPreviewIdx, setEditPreviewIdx] = useState(0);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const categoriesList = ["All", "Exchange", "Giveaway", "Request"];

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setLoading(false);
      });
  }, []);

  const filtered = posts.filter((p) => {
    const matchFilter = filter === "All" || p.type === filter;
    const matchSearch = search === "" || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleToggleAvailability = async (id: number, available: boolean) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: available }),
      });
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, is_available: available } : p)));
      }
    } catch (err) {
      console.error("Toggle availability failed:", err);
    }
  };

  const openEditModal = (post: Post) => {
    setEditPost(post);
    setEditTitle(post.title);
    setEditDesc(post.description);
    setEditType(post.type);
    setEditPrice(post.price || "");
    setEditCategory(post.category || "");
    setEditImages(post.images || []);
    setEditPreviewIdx(0);
    setEditError("");
    setEditSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editPost) return;
    setEditError("");
    setEditSaving(true);
    try {
      const res = await fetch(`/api/posts/${editPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          type: editType,
          price: editPrice,
          category: editCategory,
          images: editImages,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.error || "Failed to update");
        setEditSaving(false);
        return;
      }
      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      setEditPost(null);
    } catch {
      setEditError("Something went wrong");
      setEditSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-6 py-1 sm:py-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Title */}
      <div>
        <h1 className="text-lg sm:text-3xl lg:text-5xl font-normal text-text-primary">Marketplace</h1>
      </div>

      {warning && (
        <div className="rounded-[12px] sm:rounded-[24px] border border-yellow-300 bg-yellow-50 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-yellow-900">
          {warning}
        </div>
      )}

      {/* Filters + Search + Add Post */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar pb-1">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-base font-medium transition-all duration-200 cursor-pointer ${
                filter === cat
                  ? "bg-[#1D1B17] text-white shadow-sm"
                  : "bg-surface text-[#666666] hover:bg-gray-100 hover:text-[#222222]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border-default bg-surface px-2.5 sm:px-4 py-2 sm:py-3 flex-1 sm:flex-initial">
            <Search size={14} className="text-text-muted sm:w-[18px] sm:h-[18px]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-40 bg-transparent text-xs sm:text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-text-muted">
                <X size={12} className="sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              if (status === "loading") return;
              if (session?.user) {
                setWarning("");
                router.push("/dashboard/marketplace/create");
              } else {
                setWarning("Please sign in to post.");
                window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: "/dashboard/marketplace/create" } }));
              }
            }}
            className="shrink-0 inline-flex items-center justify-center rounded-full bg-accent px-3.5 sm:px-5 py-2 sm:py-3 text-xs sm:text-base font-semibold text-text-primary transition-colors hover:bg-accent-hover"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-[16px] sm:rounded-[24px] bg-surface py-10 sm:py-16 shadow-sm">
          <Loader2 size={24} className="animate-spin text-text-muted sm:w-8 sm:h-8" />
          <p className="mt-2 text-xs sm:text-sm text-text-muted">Loading listings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[16px] sm:rounded-[24px] bg-surface py-10 sm:py-16 shadow-sm">
          <Tag size={36} strokeWidth={1} className="text-text-muted sm:w-12 sm:h-12" />
          <p className="mt-3 text-sm sm:text-lg font-medium text-text-muted">No listings yet</p>
          <p className="mt-0.5 text-xs sm:text-base text-text-muted">Check back later!</p>
        </div>
      ) : (
        /* Product grid */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {filtered.map((item) => {
            const cfg = typeConfig[item.type] || typeConfig.Exchange;
            const Icon = cfg.icon;
            const isOwner = session?.user && String(item.user_id) === String((session.user as { id: string }).id);
            return (
              <Link
                key={item.id}
                href={`/dashboard/marketplace/${item.id}`}
                className="relative rounded-[14px] sm:rounded-[24px] bg-surface p-2 sm:p-3 shadow-sm transition-all hover:shadow-md"
              >
                <div className="absolute right-2.5 top-2.5 sm:right-5 sm:top-5 z-20">
                  <ThreeDotMenu
                    id={item.id}
                    isOwner={!!isOwner}
                    shareUrl={`${window.location.origin}/dashboard/marketplace/${item.id}`}
                    onDelete={handleDelete}
                    onEdit={() => openEditModal(item)}
                    type={item.type}
                    isAvailable={item.is_available !== false}
                    onToggleAvailability={isOwner ? handleToggleAvailability : undefined}
                  />
                </div>
                <div className={`relative flex h-[120px] sm:h-[240px] items-center justify-center overflow-hidden rounded-[10px] sm:rounded-[16px] ${(item.images && item.images.length > 0) || item.image_url ? "bg-surface-alt" : "border border-border-default bg-surface"}`}>
                  {(item.images && item.images.length > 0) || item.image_url ? (
                    <img
                      src={(item.images && item.images[0]) || item.image_url || ""}
                      alt={item.title}
                      className={`cursor-pointer transition-transform hover:scale-105 h-full w-full object-cover ${item.is_available === false ? "opacity-60" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLightbox({ src: (item.images && item.images[0]) || item.image_url || "", alt: item.title });
                      }}
                    />
                  ) : (
                    <Icon size={40} strokeWidth={1.5} className="text-[#B0B0B0] sm:w-20 sm:h-20" />
                  )}
                  {item.is_available === false && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded-full bg-red-500/90 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-sm font-bold text-white shadow-lg">Not Available</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 sm:mt-4">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-base font-semibold ${cfg.badge}`}>
                      {item.type}
                    </span>
                    <span className="text-[9px] sm:text-base text-text-muted">{timeAgo(item.created_at)}</span>
                  </div>
                  <h3 className="mt-1.5 sm:mt-3 text-xs sm:text-lg font-semibold text-text-primary line-clamp-1">{item.title}</h3>
                  <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-base text-text-secondary line-clamp-1">{item.description}</p>
                  <div className="mt-2 sm:mt-3 flex items-center justify-between">
                    <span className="text-[10px] sm:text-base text-text-secondary">
                      {item.type === "Giveaway" ? "Free" :
                       item.type === "Exchange" ? (item.price ? `Preferred: ${item.price}` : "Swap") :
                       "Request"}
                    </span>
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <button className="w-full rounded-full bg-accent px-3 sm:px-4 py-1.5 sm:py-2.5 text-[10px] sm:text-base font-semibold text-text-primary transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editPost && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4" onClick={() => setEditPost(null)}>
          <div
            className="relative w-full sm:max-w-3xl bg-white sm:rounded-[24px] rounded-t-[24px] sm:p-6 p-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center mb-3">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <button
              onClick={() => setEditPost(null)}
              className="absolute right-4 top-4 sm:right-5 sm:top-5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <X size={14} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Edit Listing</h2>
            {editError && (
              <div className="mb-3 sm:mb-4 rounded-[10px] sm:rounded-[16px] border border-red-200 bg-red-50 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-red-600">{editError}</div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1 space-y-3 sm:space-y-5">
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-semibold text-gray-800">Type</label>
                  <div className="flex gap-1.5 sm:gap-2">
                    {postTypes.map((t) => {
                      const Icon = t.icon;
                      const isSelected = editType === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setEditType(t.value)}
                          className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium transition-all ${
                            isSelected ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <Icon size={12} className="sm:w-[14px] sm:h-[14px]" /> {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="mb-1 block text-xs sm:text-sm font-semibold text-gray-800">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-[10px] sm:rounded-[14px] border border-gray-200 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs sm:text-sm font-semibold text-gray-800">
                      {editType === "Exchange" ? "Want in return" : "Type"}
                    </label>
                    {editType === "Exchange" ? (
                      <input
                        type="text"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full rounded-[10px] sm:rounded-[14px] border border-gray-200 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                        placeholder="e.g. Samsung case"
                      />
                    ) : (
                      <input
                        type="text"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full rounded-[10px] sm:rounded-[14px] border border-gray-200 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                        placeholder={editType === "Giveaway" ? "Free" : "e.g. Samsung case"}
                        disabled={editType === "Giveaway"}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-semibold text-gray-800">Category</label>
                  <div className="relative">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full appearance-none rounded-[10px] sm:rounded-[14px] border border-gray-200 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 pr-10 text-xs sm:text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                    >
                      <option value="">Select</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-semibold text-gray-800">Description</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-[10px] sm:rounded-[14px] border border-gray-200 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-semibold text-gray-800">Photos</label>
                  <MultiImageUploader onUpload={setEditImages} currentImages={editImages} maxImages={4} />
                </div>
              </div>
              <div className="hidden sm:block w-[260px] flex-shrink-0">
                <span className="text-xs font-medium text-gray-400">Preview</span>
                <div className="mt-2 rounded-[16px] bg-gray-50 p-4">
                  <div className={`flex h-[180px] items-center justify-center overflow-hidden rounded-[12px] ${editImages.length > 0 ? "bg-gray-100" : "border border-gray-200 bg-white"}`}>
                    {editImages.length > 0 ? (
                      <img src={editImages[Math.min(editPreviewIdx, editImages.length - 1)]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Tag size={48} strokeWidth={1.5} className="text-gray-300" />
                    )}
                  </div>
                  {editImages.length > 1 && (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditPreviewIdx((editPreviewIdx - 1 + editImages.length) % editImages.length)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-[10px] text-gray-500">{editPreviewIdx + 1}/{editImages.length}</span>
                      <button
                        onClick={() => setEditPreviewIdx((editPreviewIdx + 1) % editImages.length)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                  <div className="mt-3">
                    <span className="rounded-full border border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{editType}</span>
                    <h4 className="mt-1 text-sm font-semibold text-gray-800 line-clamp-1">{editTitle || "Title"}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{editDesc || "Description..."}</p>
                    <p className="mt-1 text-[11px] text-gray-500">
                      {editType === "Giveaway" ? "Free" : editType === "Exchange" ? (editPrice ? `Preferred: ${editPrice}` : "Swap") : "Request"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 flex items-center justify-end gap-2.5 sm:gap-3 border-t border-gray-100 pt-3 sm:pt-4">
              <button
                onClick={() => setEditPost(null)}
                className="rounded-full border border-gray-200 bg-white px-5 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-accent px-5 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-900 transition-colors disabled:opacity-50"
              >
                {editSaving ? <Loader2 size={14} className="animate-spin sm:w-[16px] sm:h-[16px]" /> : null}
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
