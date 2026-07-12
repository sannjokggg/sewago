"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, MapPin, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import MultiImageUploader from "@/components/multi-image-uploader";

const categories = [
  "Education", "Technology", "Health & Wellness", "Community",
  "Sports", "Arts & Culture", "Business", "Social",
];

const categoryColors: Record<string, string> = {
  Education: "bg-blue-100 text-blue-700",
  Technology: "bg-purple-100 text-purple-700",
  "Health & Wellness": "bg-red-100 text-red-700",
  Community: "bg-emerald-100 text-emerald-700",
  Sports: "bg-amber-100 text-amber-700",
  "Arts & Culture": "bg-pink-100 text-pink-700",
  Business: "bg-indigo-100 text-indigo-700",
  Social: "bg-orange-100 text-orange-700",
};

export default function CreateEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewIdx, setPreviewIdx] = useState(0);

  useEffect(() => {
    if (images.length === 0) setPreviewIdx(0);
    else if (previewIdx >= images.length) setPreviewIdx(images.length - 1);
  }, [images.length, previewIdx]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          event_date: eventDate,
          event_time: eventTime || undefined,
          location: location || undefined,
          images,
          image_url: images.length > 0 ? images[0] : undefined,
          contact_email: contactEmail || undefined,
          contact_phone: contactPhone || undefined,
          max_attendees: maxAttendees ? Number(maxAttendees) : undefined,
          registration_link: registrationLink || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create event");
        setLoading(false);
        return;
      }

      router.push("/dashboard/events");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-6 py-1 sm:py-2 pb-24 sm:pb-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="flex items-center gap-2.5 sm:gap-4">
        <Link
          href="/dashboard/events"
          className="flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-surface shadow-sm transition-all hover:bg-gray-100 hover:shadow-md"
        >
          <ArrowLeft size={16} strokeWidth={2} className="sm:w-[22px] sm:h-[22px]" />
        </Link>
        <div>
          <h1 className="text-base sm:text-2xl lg:text-4xl font-normal text-text-primary">Create Event</h1>
          <p className="text-[11px] sm:text-lg text-text-secondary">Share an event with your community</p>
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

            {/* Event Details */}
            <div className="mb-4 sm:mb-6">
              <label className="mb-0.5 sm:mb-1 block text-sm sm:text-lg font-semibold text-text-primary">Event Details</label>
              <p className="text-[10px] sm:text-base text-text-muted">Basic information about your event</p>
              <div className="mt-2.5 sm:mt-4 flex flex-col gap-2.5 sm:gap-4">
                <div>
                  <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-text-primary">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                    placeholder="e.g. Community Yoga Workshop"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-text-primary">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                    placeholder="Describe the event, what to expect, who should attend..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="mb-4 sm:mb-6">
              <label className="mb-0.5 sm:mb-1 block text-sm sm:text-lg font-semibold text-text-primary">Category</label>
              <p className="text-[10px] sm:text-base text-text-muted">Choose a category for your event</p>
              <div className="mt-2.5 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                      category === cat
                        ? "bg-[#1D1B17] text-white shadow-sm"
                        : "bg-surface text-text-secondary border border-border-default hover:bg-surface-alt hover:text-text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="mb-4 sm:mb-6">
              <label className="mb-0.5 sm:mb-1 block text-sm sm:text-lg font-semibold text-text-primary">Date & Time</label>
              <div className="mt-2.5 sm:mt-4 grid grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-text-primary">
                    <CalendarDays size={14} className="mr-1.5 inline" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-text-primary">
                    <Clock size={14} className="mr-1.5 inline" />
                    Time (optional)
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-4 sm:mb-6">
              <label className="mb-0.5 sm:mb-1 block text-sm sm:text-lg font-semibold text-text-primary">Location</label>
              <div className="mt-2.5 sm:mt-4">
                <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-text-primary">
                  <MapPin size={14} className="mr-1.5 inline" />
                  Where is it happening?
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                  placeholder="e.g. Kathmandu Community Center"
                />
              </div>
            </div>

            {/* Contact & Registration */}
            <div className="mb-4 sm:mb-6">
              <label className="mb-0.5 sm:mb-1 block text-sm sm:text-lg font-semibold text-text-primary">Contact & Registration</label>
              <p className="text-[10px] sm:text-base text-text-muted">How can attendees reach you?</p>
              <div className="mt-2.5 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-text-primary">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                    placeholder="e.g. organizer@email.com"
                  />
                </div>
                <div>
                  <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-text-primary">Contact Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                    placeholder="e.g. +977 9800000000"
                  />
                </div>
                <div>
                  <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-text-primary">Max Attendees</label>
                  <input
                    type="number"
                    value={maxAttendees}
                    onChange={(e) => setMaxAttendees(e.target.value)}
                    min="1"
                    className="w-full rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-text-primary">Registration Link</label>
                  <input
                    type="url"
                    value={registrationLink}
                    onChange={(e) => setRegistrationLink(e.target.value)}
                    className="w-full rounded-[10px] sm:rounded-[14px] border border-border-default bg-surface-alt px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-lg outline-none transition-all placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-2 focus:ring-gray-100"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="mb-3 sm:mb-6">
              <label className="mb-1 sm:mb-2 block text-xs sm:text-lg font-medium text-text-primary">Photos</label>
              <p className="mb-1.5 sm:mb-2 text-[9px] sm:text-sm text-text-muted">Add a cover photo for your event</p>
              <MultiImageUploader onUpload={setImages} currentImages={images} maxImages={4} />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-4 mt-4 sm:mt-auto pt-2">
              <Link
                href="/dashboard/events"
                className="rounded-full border border-border-default bg-surface px-5 sm:px-10 py-2 sm:py-3.5 text-xs sm:text-lg font-medium text-text-secondary transition-all hover:bg-surface-alt"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !category}
                className="flex items-center gap-1.5 sm:gap-2.5 rounded-full bg-accent px-6 sm:px-12 py-2 sm:py-3.5 text-xs sm:text-lg font-semibold text-text-primary transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin sm:w-[18px] sm:h-[18px]" /> : null}
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </form>

        {/* Live Preview */}
        <div className="hidden lg:block w-[440px] flex-shrink-0 relative">
          <span className="absolute -top-7 left-0 text-base font-medium text-text-muted">Live Preview</span>
          <div className="rounded-[24px] bg-surface p-6 shadow-sm h-full flex flex-col">
            <div className={`max-h-[540px] min-h-[540px] relative flex items-center justify-center overflow-hidden rounded-[16px] ${
              images.length > 0 ? "bg-surface-alt" : "border border-border-default bg-surface"
            }`}>
              {images.length > 0 ? (
                <>
                  <img src={images[Math.min(previewIdx, images.length - 1)]} alt="Preview" className="h-full w-full object-contain" />
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
                {category && (
                  <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${categoryColors[category] || "bg-gray-100 text-gray-700"}`}>
                    {category}
                  </span>
                )}
                <span className="text-xs text-text-muted">Just now</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-text-primary">
                {title || "Your title here"}
              </h3>
              <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                {description || "Your description will appear here..."}
              </p>
              <div className="mt-3 flex flex-col gap-1">
                {eventDate && (
                  <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <CalendarDays size={11} />
                    {new Date(eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {eventTime && ` at ${eventTime}`}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <MapPin size={11} />
                    {location}
                  </span>
                )}
                {maxAttendees && (
                  <span className="text-[11px] text-text-muted">{maxAttendees} max attendees</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
