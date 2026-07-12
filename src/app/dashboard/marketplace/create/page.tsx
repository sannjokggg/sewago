"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag, ArrowLeftRight, Gift, UserPlus, ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import MultiImageUploader from "@/components/multi-image-uploader";

const postTypes = [
  { value: "Exchange", label: "Exchange", icon: ArrowLeftRight, gradient: "from-gray-200 to-gray-300" },
  { value: "Giveaway", label: "Giveaway", icon: Gift, gradient: "from-gray-200 to-gray-300" },
  { value: "Request", label: "Request", icon: UserPlus, gradient: "from-gray-200 to-gray-300" },
];

const categories = [
  "Electronics", "Furniture", "Clothing", "Books", "Sports",
  "Home & Garden", "Vehicles", "Toys", "Other",
];

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Exchange");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewIdx, setPreviewIdx] = useState(0);

  useEffect(() => {
    if (images.length === 0) setPreviewIdx(0);
    else if (previewIdx >= images.length) setPreviewIdx(images.length - 1);
  }, [images.length, previewIdx]);

  const selectedType = postTypes.find((t) => t.value === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, price, category, images }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create post");
        setLoading(false);
        return;
      }

      router.push("/dashboard/marketplace");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-6 py-1 sm:py-2 pb-24 sm:pb-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <Link
          href="/dashboard/marketplace"
          className="flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-surface shadow-sm transition-all hover:bg-gray-100 hover:shadow-md"
        >
          <ArrowLeft size={16} strokeWidth={2} className="sm:w-[22px] sm:h-[22px]" />
        </Link>
        <div>
          <h1 className="text-base sm:text-2xl lg:text-4xl font-normal text-text-primary">Create Listing</h1>
          <p className="text-[11px] sm:text-lg text-text-secondary">Post something to the community</p>
        </div>
      </div>

      <div className="flex gap-4 sm:gap-6 items-stretch flex-col lg:flex-row">
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="rounded-[16px] sm:rounded-[24px] bg-surface p-3 sm:p-6 shadow-sm">
            {error && (
              <div className="mb-3 sm:mb-6 rounded-[10px] sm:rounded-[16px] border border-red-200 bg-red-50 px-3 sm:px-5 py-2.5 sm:py-4 text-xs sm:text-base text-red-600">
                {error}
              </div>
            )}

            {/* Post Type */}
            <div className="mb-4 sm:mb-6">
              <label className="mb-0.5 sm:mb-1 block text-sm sm:text-lg font-semibold text-text-primary">What are you posting?</label>
              <p className="text-[10px] sm:text-base text-text-muted">Select the type of listing</p>
              <div className="mt-2.5 sm:mt-4 flex gap-1.5 sm:gap-3">
                {postTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`flex items-center gap-1.5 sm:gap-3 rounded-full px-3 sm:px-6 py-2 sm:py-3.5 text-xs sm:text-lg font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-surface text-text-primary shadow-md ring-1 sm:ring-2 ring-gray-300"
                          : "bg-surface-alt text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                      }`}
                    >
                      <div className={`flex h-5 w-5 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient}`}>
                        <Icon size={10} strokeWidth={2.5} className="text-text-secondary sm:w-4 sm:h-4" />
                      </div>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields */}
            <div className="mb-3 sm:mb-6 grid grid-cols-1 sm:grid-cols-[1fr_240px_260px] gap-2.5 sm:gap-4 sm:gap-5">
              <div>
                <label className="mb-1 sm:mb-2 block text-xs sm:text-lg font-medium text-text-primary">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                  placeholder="e.g. MacBook Pro 2021"
                  required
                />
              </div>
              <div>
                <label className="mb-1 sm:mb-2 block text-xs sm:text-lg font-medium text-text-primary">
                  {type === "Exchange" ? "Want in return" : "Type"}
                </label>
                {type === "Exchange" ? (
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                    placeholder="e.g. Samsung case"
                  />
                ) : (
                  <div className="flex items-center rounded-[10px] sm:rounded-[14px] border border-border-light bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg text-text-muted">
                    {type === "Giveaway" ? "Free" : "Looking for this"}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 sm:mb-2 block text-xs sm:text-lg font-medium text-text-primary">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 pr-8 sm:pr-10 text-xs sm:text-lg outline-none transition-all focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                  >
                    <option value="">Select</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-text-muted sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-3 sm:mb-6">
              <label className="mb-1 sm:mb-2 block text-xs sm:text-lg font-medium text-text-primary">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                placeholder="Describe your item, condition, any details buyers should know..."
                required
              />
            </div>

            {/* Photos */}
            <div className="mb-3 sm:mb-6">
              <label className="mb-1 sm:mb-2 block text-xs sm:text-lg font-medium text-text-primary">Photos</label>
              <p className="mb-1.5 sm:mb-2 text-[9px] sm:text-sm text-text-muted">Up to 4 photos</p>
              <MultiImageUploader onUpload={setImages} currentImages={images} maxImages={4} />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-4 mt-4 sm:mt-auto pt-2">
              <Link
                href="/dashboard/marketplace"
                className="rounded-full border border-border-default bg-surface px-5 sm:px-10 py-2 sm:py-3.5 text-xs sm:text-lg font-medium text-text-secondary transition-all hover:bg-surface-alt"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 sm:gap-2.5 rounded-full bg-accent px-6 sm:px-12 py-2 sm:py-3.5 text-xs sm:text-lg font-semibold text-text-primary transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin sm:w-[18px] sm:h-[18px]" /> : null}
                {loading ? "Posting..." : "Post Listing"}
              </button>
            </div>
          </div>
        </form>

        {/* Live Preview - hidden on phone */}
        <div className="hidden lg:block w-[440px] flex-shrink-0 relative">
          <span className="absolute -top-7 left-0 text-base font-medium text-text-muted">Live Preview</span>
          <div className="rounded-[24px] bg-surface p-6 shadow-sm h-full flex flex-col">
            <div className={`max-h-[540px] min-h-[540px] relative flex items-center justify-center overflow-hidden rounded-[16px] ${images.length > 0 ? "bg-surface-alt" : "border border-border-default bg-surface"}`}>
              {images.length > 0 ? (
                <>
                  <img src={images[Math.min(previewIdx, images.length - 1)]} alt="Preview" className="h-full w-full object-cover" />
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPreviewIdx((previewIdx - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewIdx((previewIdx + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <span className="absolute bottom-2 right-3 text-[10px] font-medium text-white bg-black/40 rounded-full px-2 py-0.5">{previewIdx + 1}/{images.length}</span>
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-[#B0B0B0]">Your uploaded image will be shown here</p>
              )}
            </div>
            <div className="mt-auto pt-12">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold border border-gray-300 text-text-secondary`}>
                  {type}
                </span>
                <span className="text-xs text-text-muted">Just now</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-text-primary">
                {title || "Your title here"}
              </h3>
              <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                {description || "Your description will appear here..."}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  {type === "Giveaway" ? "Free" :
                   type === "Exchange" ? (price ? `Preferred: ${price}` : "Swap") :
                   "Request"}
                </span>
                <span className="text-sm text-text-muted">by you</span>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
