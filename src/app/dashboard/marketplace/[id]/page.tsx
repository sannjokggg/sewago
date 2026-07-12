"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, Tag, ArrowLeftRight, Gift, UserPlus, Loader2, MessageSquare,
  Send, Clock, X, Check, Package, ChevronLeft, ChevronRight,
} from "lucide-react";
import ImageLightbox from "@/components/image-lightbox";
import ThreeDotMenu from "@/components/three-dot-menu";
import MultiImageUploader from "@/components/multi-image-uploader";

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  user_name: string;
  created_at: string;
}

interface Offer {
  id: number;
  post_id: number;
  user_id: number;
  message: string;
  offer_item: string;
  offer_images: string[];
  status: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

interface PostDetail {
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
  user_email: string;
  created_at: string;
  comments: Comment[];
  is_available: boolean;
}

interface SimilarPost {
  id: number;
  title: string;
  type: string;
  price: string | null;
  category: string | null;
  image_url: string | null;
  images: string[];
  user_name: string;
}

const typeConfig: Record<string, { badge: string; icon: typeof Tag }> = {
  Exchange: { badge: "border border-gray-300 text-text-secondary", icon: ArrowLeftRight },
  Giveaway: { badge: "border border-gray-300 text-text-secondary", icon: Gift },
  Request: { badge: "border border-gray-300 text-text-secondary", icon: UserPlus },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const myId = Number((session?.user as { id?: string } | undefined)?.id || 0);
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [viewerScale, setViewerScale] = useState(1);
  const viewerRef = useRef<HTMLDivElement>(null);

  const [deleting, setDeleting] = useState(false);
  const [editPost, setEditPost] = useState<PostDetail | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editType, setEditType] = useState("Exchange");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editPreviewIdx, setEditPreviewIdx] = useState(0);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [similarPosts, setSimilarPosts] = useState<SimilarPost[]>([]);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersPage, setOffersPage] = useState(1);
  const OFFERS_PER_PAGE = 2;
  const [offerContent, setOfferContent] = useState("");
  const [offerImages, setOfferImages] = useState<string[]>([]);
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const sortedOffers = [...offers].sort((a, b) => {
    const order: Record<string, number> = { pending: 0, accepted: 1, declined: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
      if (data.error) { router.push("/dashboard/marketplace"); return; }
      setPost(data);

      const allRes = await fetch("/api/posts");
      const allData = await allRes.json();
      if (Array.isArray(allData)) {
        const sameCat = allData.filter((p: SimilarPost) => p.id !== Number(postId) && p.category === data.category);
        const others = allData.filter((p: SimilarPost) => p.id !== Number(postId) && p.category !== data.category);
        setSimilarPosts([...sameCat, ...others].slice(0, 4));
      }

      const offersRes = await fetch(`/api/offers?post_id=${postId}`);
      const offersData = await offersRes.json();
      if (Array.isArray(offersData)) setOffers(offersData);
    } catch { router.push("/dashboard/marketplace"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPost(); }, [postId]);

  useEffect(() => { setViewerScale(1); }, [selectedImage]);

  const handleViewerWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewerScale((prev) => Math.min(Math.max(prev + (e.deltaY > 0 ? -0.15 : 0.15), 1), 3));
  }, []);

  const handleToggleAvailability = async (id: number, available: boolean) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: available }),
      });
      if (res.ok) {
        setPost((prev) => prev ? { ...prev, is_available: available } : prev);
      }
    } catch (err) {
      console.error("Toggle availability failed:", err);
    }
  };

  const handleOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerContent.trim() && offerImages.length === 0) return;
    setSubmittingOffer(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: Number(postId),
          offer_item: offerContent,
          message: "",
          offer_images: offerImages,
        }),
      });
      if (res.ok) {
        setOfferContent(""); setOfferImages([]); setOffersPage(1); fetchPost();
      }
    } finally { setSubmittingOffer(false); }
  };

  const handleOfferStatus = async (offerId: number, status: string) => {
    try {
      await fetch("/api/offers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: offerId, status }),
      });
      fetchPost();
    } catch {}
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(postId) }),
      });
      if (res.ok) router.push("/dashboard/marketplace");
    } finally { setDeleting(false); }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-text-muted" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  const cfg = typeConfig[post.type] || typeConfig.Exchange;
  const Icon = cfg.icon;
  const allImages = post.images?.length > 0 ? post.images : post.image_url ? [post.image_url] : [];

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0 gap-0 lg:overflow-hidden pb-20 sm:pb-0" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Mobile: Rounded Image with Back + Overlays */}
      <div className="lg:hidden px-4">
        <div className="relative w-full h-[380px] rounded-[20px] overflow-hidden bg-surface-alt shadow-sm">
          {allImages.length > 0 ? (
            <>
              <img
                src={allImages[selectedImage]}
                alt={post.title}
                className={`h-full w-full object-cover ${post.is_available === false ? "opacity-60" : ""}`}
                onClick={() => setLightbox({ src: allImages[selectedImage], alt: post.title })}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Icon size={80} strokeWidth={1.2} className="text-[#B0B0B0]" />
            </div>
          )}
          {post.is_available === false && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="rounded-full bg-red-500/90 px-5 py-2 text-sm font-bold text-white shadow-lg">Not Available</span>
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 backdrop-blur-md text-text-primary shadow-md"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Price Badge */}
          {post.type === "Giveaway" && (
            <div className="absolute bottom-3 left-3 z-10 rounded-full bg-accent px-4 py-1.5 shadow-md">
              <span className="text-sm font-bold text-text-primary">Free</span>
            </div>
          )}

          {/* Image Dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-1.5 rounded-full transition-all ${selectedImage === i ? "w-5 bg-surface" : "w-1.5 bg-surface/50"}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-[44px] w-[44px] flex-shrink-0 overflow-hidden rounded-[8px] border-2 transition-all ${
                    selectedImage === i ? "border-white opacity-100" : "border-transparent opacity-60"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Side-by-side Layout */}
      <div className="hidden lg:flex w-full h-full min-h-0 px-6 py-4 overflow-hidden">
        <div className="flex max-w-[1200px] w-full h-full min-h-0 gap-8 mx-auto">
          {/* Image Viewer - fixed height */}
          <div className="flex w-[520px] flex-shrink-0 flex-col gap-3 min-h-0 h-full">
            <div ref={viewerRef} onWheel={handleViewerWheel} className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden rounded-[20px] bg-surface-alt">
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[selectedImage]}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover blur-lg scale-110 opacity-40"
                  />
                  <img
                    src={allImages[selectedImage]}
                    alt={post.title}
                    className={`relative max-h-full w-full cursor-pointer object-contain transition-transform duration-200 ${post.is_available === false ? "opacity-60" : ""}`}
                    style={{ transform: `scale(${viewerScale})` }}
                    onClick={() => {
                      if (viewerScale > 1) return;
                      setLightbox({ src: allImages[selectedImage], alt: post.title });
                    }}
                  />
                  {post.is_available === false && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="rounded-full bg-red-500/90 px-5 py-2 text-sm font-bold text-white shadow-lg">Not Available</span>
                    </div>
                  )}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage((prev) => prev > 0 ? prev - 1 : allImages.length - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 text-text-primary shadow-sm hover:bg-surface transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setSelectedImage((prev) => prev < allImages.length - 1 ? prev + 1 : 0)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 text-text-primary shadow-sm hover:bg-surface transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedImage(i)}
                            className={`h-2 rounded-full transition-all ${selectedImage === i ? "w-6 bg-[#202124]" : "w-2 bg-gray-300"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Icon size={80} strokeWidth={1.2} className="text-[#B0B0B0]" />
                  <span className="text-base text-text-muted">No image</span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 flex-shrink-0">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[12px] border-2 transition-all ${
                      selectedImage === i ? "border-[#202124] opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Content - title fixed, offers scrollable */}
          <div className="flex-1 min-h-0 h-full flex flex-col gap-5 pb-4 overflow-hidden">
            <div className="rounded-[24px] bg-surface p-6 shadow-sm flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3.5 py-1 text-sm font-semibold ${cfg.badge}`}>
                    {post.type}
                  </span>
                  {post.category && (
                    <span className="rounded-full border border-border-default px-3.5 py-1 text-sm font-medium text-text-secondary">
                      {post.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-text-muted">
                    <Clock size={13} />
                    {timeAgo(post.created_at)}
                  </span>
                </div>
                {myId === post.user_id && (
                  <ThreeDotMenu
                    id={post.id}
                    isOwner={true}
                    shareUrl={`${window.location.origin}/dashboard/marketplace/${post.id}`}
                    onDelete={async (id) => {
                      const res = await fetch("/api/posts", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id }),
                      });
                      if (res.ok) router.push("/dashboard/marketplace");
                    }}
                    onEdit={() => {
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
                    }}
                    isAvailable={post.is_available !== false}
                    onToggleAvailability={handleToggleAvailability}
                  />
                )}
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-text-primary">{post.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{post.description}</p>
              <div className="mt-4">
                {post.type === "Exchange" && post.price && (
                  <p className="text-sm text-text-secondary">Preferred: {post.price}</p>
                )}
                {post.type === "Giveaway" && (
                  <p className="text-2xl font-bold text-accent">Free</p>
                )}
                {post.type === "Request" && (
                  <p className="text-xl font-semibold text-text-primary">Looking for this</p>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 rounded-[24px] bg-surface p-6 shadow-sm flex flex-col overflow-hidden">
              {post.is_available === false && (
                <div className="mb-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 flex-shrink-0">
                  This item is no longer available.
                </div>
              )}
              <h2 className="text-lg font-semibold text-text-primary flex-shrink-0">
                Offers
                <span className="ml-2 text-sm font-normal text-text-muted">({offers.length})</span>
              </h2>
              {myId !== post.user_id && post.is_available !== false && (
                <form onSubmit={handleOffer} className="mt-4 flex flex-col gap-3 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      value={offerContent}
                      onChange={(e) => setOfferContent(e.target.value)}
                      placeholder="What are you offering?"
                      className="flex-1 rounded-full border border-border-default bg-surface-alt px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-1 focus:ring-gray-100"
                    />
                    <button
                      type="submit"
                      disabled={(!offerContent.trim() && offerImages.length === 0) || submittingOffer}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingOffer ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} strokeWidth={2} />}
                    </button>
                  </div>
                  <MultiImageUploader onUpload={setOfferImages} currentImages={offerImages} maxImages={4} />
                </form>
              )}
              <div className="mt-4 flex flex-col gap-3 overflow-y-auto min-h-0 chat-scrollbar flex-1">
                {sortedOffers.slice(0, offersPage * OFFERS_PER_PAGE).map((offer) => (
                  <div key={offer.id} className="rounded-[14px] border border-border-light bg-surface-alt p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-[10px] font-semibold text-text-primary">
                          {offer.user_name[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{offer.user_name}</p>
                          <p className="text-[11px] text-text-muted">{timeAgo(offer.created_at)}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        offer.status === "accepted" ? "bg-green-50 text-green-600" :
                        offer.status === "declined" ? "bg-red-50 text-red-500" :
                        "bg-border-light text-text-muted"
                      }`}>
                        {offer.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{offer.offer_item}</p>
                    {offer.offer_images && offer.offer_images.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {offer.offer_images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setLightbox({ src: img, alt: `Offer image ${i + 1}` })}
                            className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[10px] border border-border-light"
                          >
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    {myId === post.user_id && (
                      <div className="mt-2.5 flex gap-2 flex-wrap">
                        {offer.status === "pending" && (
                          <>
                            <button
                              onClick={() => { handleOfferStatus(offer.id, "accepted"); router.push(`/dashboard/messages?userId=${offer.user_id}`); }}
                              className="flex items-center gap-1 rounded-full bg-accent border border-[#B8F25E] px-3.5 py-1.5 text-sm font-medium text-text-primary hover:bg-accent-hover transition-colors"
                            >
                              <Check size={13} /> Accept
                            </button>
                            <button
                              onClick={() => handleOfferStatus(offer.id, "declined")}
                              className="flex items-center gap-1 rounded-full bg-border-light border border-border-default px-3.5 py-1.5 text-sm font-medium text-text-secondary hover:bg-gray-200 transition-colors"
                            >
                              <X size={13} /> Decline
                            </button>
                          </>
                        )}
                        {offer.status === "accepted" && (
                          <button
                            onClick={() => router.push(`/dashboard/messages?userId=${offer.user_id}`)}
                            className="flex items-center gap-1 rounded-full bg-accent border border-[#B8F25E] px-3.5 py-1.5 text-sm font-medium text-text-primary hover:bg-accent-hover transition-colors"
                          >
                            <MessageSquare size={13} /> Message
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {offers.length === 0 && (
                  <div className="rounded-[14px] border border-border-light bg-surface-alt py-8 text-center">
                    <Package size={28} strokeWidth={1.5} className="mx-auto text-[#D1D5DB]" />
                    <p className="mt-2 text-sm text-text-muted">
                      No offers yet{myId !== post.user_id ? ". Be the first to make an offer!" : ""}
                    </p>
                  </div>
                )}
                {offersPage * OFFERS_PER_PAGE < sortedOffers.length && (
                  <button
                    onClick={() => setOffersPage((p) => p + 1)}
                    className="mt-1 w-full rounded-full border border-border-default bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-surface-alt"
                  >
                    Show more ({sortedOffers.length - offersPage * OFFERS_PER_PAGE} remaining)
                  </button>
                )}
              </div>
            </div>

            {similarPosts.length > 0 && (
              <div className="flex-shrink-0 rounded-[24px] bg-surface p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Similar Items</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {similarPosts.map((item) => {
                    const itemCfg = typeConfig[item.type] || typeConfig.Exchange;
                    const ItemIcon = itemCfg.icon;
                    const itemImages = item.images?.length > 0 ? item.images : item.image_url ? [item.image_url] : [];
                    return (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/dashboard/marketplace/${item.id}`)}
                        className="rounded-[20px] bg-surface p-3 shadow-sm text-left transition-all hover:shadow-md"
                      >
                        <div className="flex h-[150px] items-center justify-center overflow-hidden rounded-[12px] bg-surface-alt">
                          {itemImages.length > 0 ? (
                            <img src={itemImages[0]} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <ItemIcon size={36} strokeWidth={1.2} className="text-[#B0B0B0]" />
                          )}
                        </div>
                        <div className="mt-2">
                          <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{item.title}</h3>
                          <p className="mt-0.5 text-xs text-text-secondary">
                            {item.type === "Giveaway" ? "Free" :
                             item.type === "Exchange" ? (item.price ? `Preferred: ${item.price}` : "Swap") : "Request"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Content Below Image */}
      <div className="lg:hidden p-4 pt-3">
        <div className="rounded-[20px] bg-surface p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.badge}`}>
                {post.type}
              </span>
              {post.category && (
                <span className="rounded-full border border-border-default px-3 py-1 text-xs font-medium text-text-secondary">
                  {post.category}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Clock size={12} />
                {timeAgo(post.created_at)}
              </span>
            </div>
            {myId === post.user_id && (
              <ThreeDotMenu
                id={post.id}
                isOwner={true}
                shareUrl={`${window.location.origin}/dashboard/marketplace/${post.id}`}
                onDelete={async (id) => {
                  const res = await fetch("/api/posts", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                  });
                  if (res.ok) router.push("/dashboard/marketplace");
                }}
                onEdit={() => {
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
                }}
                isAvailable={post.is_available !== false}
                onToggleAvailability={handleToggleAvailability}
              />
            )}
          </div>

          <h1 className="mt-3 text-xl font-semibold text-text-primary">{post.title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{post.description}</p>

          <div className="mt-3">
                {post.type === "Exchange" && post.price && (
                  <p className="text-sm text-text-secondary">Preferred: {post.price}</p>
                )}
            {post.type === "Giveaway" && (
              <p className="text-xl font-bold text-accent">Free</p>
            )}
            {post.type === "Request" && (
              <p className="text-lg font-semibold text-text-primary">Looking for this</p>
            )}
          </div>

          <hr className="my-4 border-border-light" />

          {/* Offers */}
          <div>
            {post.is_available === false && (
              <div className="mb-3 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                This item is no longer available.
              </div>
            )}
            <h2 className="text-base font-semibold text-text-primary">
              Offers
              <span className="ml-2 text-xs font-normal text-text-muted">({offers.length})</span>
            </h2>

            {myId !== post.user_id && post.is_available !== false && (
              <form onSubmit={handleOffer} className="mt-3 flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    value={offerContent}
                    onChange={(e) => setOfferContent(e.target.value)}
                    placeholder="What are you offering?"
                    className="flex-1 rounded-full border border-border-default bg-surface-alt px-3 py-2 text-sm text-text-primary outline-none placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-1 focus:ring-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={(!offerContent.trim() && offerImages.length === 0) || submittingOffer}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingOffer ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} strokeWidth={2} />}
                  </button>
                </div>
                <MultiImageUploader onUpload={setOfferImages} currentImages={offerImages} maxImages={4} />
              </form>
            )}

            <div className="mt-3 flex flex-col gap-2.5">
              {sortedOffers.slice(0, offersPage * OFFERS_PER_PAGE).map((offer) => (
                <div key={offer.id} className="rounded-[12px] border border-border-light bg-surface-alt p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-[9px] font-semibold text-text-primary">
                        {offer.user_name[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{offer.user_name}</p>
                        <p className="text-[10px] text-text-muted">{timeAgo(offer.created_at)}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      offer.status === "accepted" ? "bg-green-50 text-green-600" :
                      offer.status === "declined" ? "bg-red-50 text-red-500" :
                      "bg-border-light text-text-muted"
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{offer.offer_item}</p>
                  {offer.offer_images && offer.offer_images.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {offer.offer_images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setLightbox({ src: img, alt: `Offer image ${i + 1}` })}
                          className="h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-[8px] border border-border-light"
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  {myId === post.user_id && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {offer.status === "pending" && (
                        <>
                          <button
                            onClick={() => { handleOfferStatus(offer.id, "accepted"); router.push(`/dashboard/messages?userId=${offer.user_id}`); }}
                            className="flex items-center gap-1 rounded-full bg-accent border border-[#B8F25E] px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-accent-hover transition-colors"
                          >
                            <Check size={12} /> Accept
                          </button>
                          <button
                            onClick={() => handleOfferStatus(offer.id, "declined")}
                            className="flex items-center gap-1 rounded-full bg-border-light border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-gray-200 transition-colors"
                          >
                            <X size={12} /> Decline
                          </button>
                        </>
                      )}
                      {offer.status === "accepted" && (
                        <button
                          onClick={() => router.push(`/dashboard/messages?userId=${offer.user_id}`)}
                          className="flex items-center gap-1 rounded-full bg-accent border border-[#B8F25E] px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-accent-hover transition-colors"
                        >
                          <MessageSquare size={12} /> Message
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {offers.length === 0 && (
                <div className="rounded-[12px] border border-border-light bg-surface-alt py-6 text-center">
                  <Package size={24} strokeWidth={1.5} className="mx-auto text-[#D1D5DB]" />
                  <p className="mt-1.5 text-xs text-text-muted">
                    No offers yet{myId !== post.user_id ? ". Be the first to make an offer!" : ""}
                  </p>
                </div>
              )}
              {offersPage * OFFERS_PER_PAGE < sortedOffers.length && (
                <button
                  onClick={() => setOffersPage((p) => p + 1)}
                  className="mt-1 w-full rounded-full border border-border-default bg-surface px-4 py-2 text-xs font-medium text-text-secondary transition-all hover:bg-surface-alt"
                >
                  Show more ({sortedOffers.length - offersPage * OFFERS_PER_PAGE} remaining)
                </button>
              )}
            </div>
          </div>

          {similarPosts.length > 0 && (
            <>
              <hr className="my-4 border-border-light" />
              <div>
                <h2 className="text-base font-semibold text-text-primary mb-3">Similar Items</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {similarPosts.map((item) => {
                    const itemCfg = typeConfig[item.type] || typeConfig.Exchange;
                    const ItemIcon = itemCfg.icon;
                    const itemImages = item.images?.length > 0 ? item.images : item.image_url ? [item.image_url] : [];
                    return (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/dashboard/marketplace/${item.id}`)}
                        className="rounded-[16px] bg-surface p-3 shadow-sm text-left transition-all hover:shadow-md"
                      >
                        <div className="flex h-[120px] items-center justify-center overflow-hidden rounded-[10px] bg-surface-alt">
                          {itemImages.length > 0 ? (
                            <img src={itemImages[0]} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <ItemIcon size={32} strokeWidth={1.2} className="text-[#B0B0B0]" />
                          )}
                        </div>
                        <div className="mt-2">
                          <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{item.title}</h3>
                          <p className="mt-0.5 text-xs text-text-secondary">
                            {item.type === "Giveaway" ? "Free" :
                             item.type === "Exchange" ? (item.price ? `Preferred: ${item.price}` : "Swap") : "Request"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      {/* Edit Modal */}
      {editPost && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4" onClick={() => setEditPost(null)}>
          <div className="relative w-full max-w-3xl sm:rounded-[24px] rounded-t-[24px] bg-white p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEditPost(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-5 sm:mb-6">Edit Listing</h2>
            {editError && (
              <div className="mb-4 rounded-[16px] border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">{editError}</div>
            )}
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
              <div className="flex-1 space-y-4 sm:space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-800">Type</label>
                  <div className="flex gap-2">
                    {[
                      { value: "Exchange", label: "Exchange", icon: ArrowLeftRight },
                      { value: "Giveaway", label: "Giveaway", icon: Gift },
                      { value: "Request", label: "Request", icon: UserPlus },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = editType === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setEditType(t.value)}
                          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                            isSelected ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <Icon size={14} /> {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-800">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-800">
                      {editType === "Exchange" ? "Want in return" : "Type"}
                    </label>
                    {editType === "Exchange" ? (
                      <input
                        type="text"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                        placeholder="e.g. Samsung case"
                      />
                    ) : (
                      <input
                        type="text"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                        placeholder={editType === "Giveaway" ? "Free" : "e.g. Samsung case"}
                        disabled={editType === "Giveaway"}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-800">Category</label>
                  <div className="relative">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full appearance-none rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                    >
                      <option value="">Select</option>
                      {["Electronics", "Furniture", "Clothing", "Books", "Sports", "Home & Garden", "Vehicles", "Toys", "Other"].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-800">Description</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-800">Photos</label>
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
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setEditPost(null)}
                className="rounded-full border border-gray-200 bg-white px-8 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
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
                    setPost((prev) => prev ? { ...prev, ...updated } : prev);
                    setEditPost(null);
                  } catch { setEditError("Something went wrong"); setEditSaving(false); }
                }}
                disabled={editSaving}
                className="flex items-center gap-2 rounded-full bg-accent px-8 py-2.5 text-sm font-semibold text-gray-900 transition-colors disabled:opacity-50"
              >
                {editSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
