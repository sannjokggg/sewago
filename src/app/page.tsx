"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, ArrowRight, ChevronDown, Loader2 } from "lucide-react";
import DonateModal from "@/components/donate-modal";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1400&h=800&fit=crop",
    title: "Together for a Sustainable Future",
    description: "Join our community to exchange, giveaway, and donate items that help protect our planet.",
  },
  {
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&h=800&fit=crop",
    title: "Fight Climate Change Together",
    description: "Participate in cleaning campaigns, plantations, and community events near you.",
  },
  {
    image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1400&h=800&fit=crop",
    title: "Empowering Communities",
    description: "Donate to NGOs, support those in need, and create lasting social impact.",
  },
  {
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1400&h=800&fit=crop",
    title: "Learn & Take Action",
    description: "Educate yourself and others about climate change, waste management, and sustainability.",
  },
];

const faqs = [
  { question: "How does the marketplace work?", answer: "You can list items for exchange, giveaway, or request. Browse sustainable products and connect with others in your community." },
  { question: "How do I find events near me?", answer: "Visit the Events section to discover cleaning campaigns, plantation drives, and community events in your area." },
  { question: "Can I donate to NGOs?", answer: "Yes! We partner with verified NGOs working on climate change, waste management, and social causes." },
  { question: "Is this platform free to use?", answer: "Yes, SewaGo is 100% free to use. Browsing, joining events, exchanging items, giving away, and donating — everything is completely free with no hidden fees." },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [showDonateModal, setShowDonateModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      setFormStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch {
      setFormStatus("error");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (window.location.hash === "#contact") {
      setTimeout(() => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="flex-1" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Hero Section */}
      <div className="relative rounded-[20px] sm:rounded-[28px] overflow-hidden h-[400px] sm:h-[500px] lg:h-[700px]">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        <div className="relative h-full flex flex-col justify-center px-6 sm:px-8 lg:px-12 max-w-[800px]">
          <h1 className="text-[28px] sm:text-[40px] lg:text-[72px] font-bold leading-[1.05] text-white">
            {heroSlides[currentSlide].title}
          </h1>

          <p className="mt-3 sm:mt-5 text-sm sm:text-lg lg:text-xl text-white/80 leading-relaxed max-w-[600px]">
            {heroSlides[currentSlide].description}
          </p>

          <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-lg font-semibold text-text-primary transition-colors hover:bg-accent-hover"
            >
              Get Started
              <ArrowUpRight size={18} />
            </a>
            <a
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-lg font-medium text-white transition-colors hover:bg-white/10"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 backdrop-blur-md hidden sm:flex items-center justify-center text-white hover:bg-white/40 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 backdrop-blur-md hidden sm:flex items-center justify-center text-white hover:bg-white/40 transition-colors"
        >
          <ChevronRight size={18} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 sm:h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-accent w-6 sm:w-8"
                  : "bg-white/50 hover:bg-white/70 w-2.5 sm:w-3"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Because Section */}
      <div className="mt-10 sm:mt-16 max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          <div>
            <h2 className="text-[32px] sm:text-[48px] lg:text-[64px] font-bold leading-[1.1] text-brand-dark">
              Because<br />Sustainability<br />Matters.
            </h2>
            <p className="mt-4 sm:mt-8 text-sm sm:text-base text-text-secondary leading-relaxed max-w-[500px]">
              We're building a community-driven platform that empowers people to take action against climate change. Exchange, giveaway, and donate items that make a difference.
            </p>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-text-secondary leading-relaxed max-w-[500px]">
              From waste management to plantation campaigns, we connect people who care about our planet. Join events, learn about sustainability, and be part of the solution.
            </p>
            <a
              href="/about"
              className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-text-primary transition-colors hover:bg-accent-hover"
            >
              About Us
            </a>
          </div>
          <div className="relative flex justify-center items-end h-full">
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=500&fit=crop"
              alt="Community working together"
              className="rounded-[16px] sm:rounded-[24px] w-full h-[250px] sm:h-[350px] lg:h-[450px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">

      {/* Choose the Pillar Section */}
      <div className="mt-12 sm:mt-20">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-[28px] sm:text-[48px] lg:text-[64px] font-bold leading-[1.05] text-brand-dark">
            Choose the<br />way you want to help.
          </h2>
          <p className="mt-4 sm:mt-6 text-sm sm:text-base text-text-secondary leading-relaxed max-w-[500px]">
            Every action counts. Pick how you want to make a difference today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Marketplace */}
          <div className="bg-[#2196F3] rounded-[20px] sm:rounded-[24px] px-3 sm:px-2 pt-5 sm:pt-6 pb-2 flex flex-col">
            <div className="pl-3 sm:pl-4">
              <div className="flex justify-between items-start">
                <h3 className="text-[24px] sm:text-[32px] font-bold text-white">Marketplace</h3>
                <span className="border-2 border-white/40 text-white text-xs sm:text-sm font-semibold w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">01</span>
              </div>
              <p className="mt-2 text-white font-semibold text-sm sm:text-base">Exchange, Giveaway & Donate</p>
              <p className="mt-2 text-white/80 text-xs sm:text-sm">Find sustainable items, give away what you don't need, or exchange with others.</p>
            </div>
            <div className="mt-auto">
              <img
                src="/uploads/exchange.jpg"
                alt="Marketplace"
                className="w-full h-[180px] sm:h-[250px] object-cover rounded-[12px] sm:rounded-[16px] mt-4 sm:mt-6"
              />
            </div>
          </div>

          {/* Events */}
          <div className="bg-[#FFC107] rounded-[20px] sm:rounded-[24px] px-3 sm:px-2 pt-5 sm:pt-6 pb-2 flex flex-col">
            <div className="pl-3 sm:pl-4">
              <div className="flex justify-between items-start">
                <h3 className="text-[24px] sm:text-[32px] font-bold text-white">Events</h3>
                <span className="border-2 border-white/40 text-white text-xs sm:text-sm font-semibold w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">02</span>
              </div>
              <p className="mt-2 text-white font-semibold text-sm sm:text-base">Join Campaigns</p>
              <p className="mt-2 text-white/80 text-xs sm:text-sm">Participate in cleaning drives, plantation events, and community gatherings near you.</p>
            </div>
            <div className="mt-auto">
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=200&fit=crop"
                alt="Events"
                className="w-full h-[180px] sm:h-[250px] object-cover rounded-[12px] sm:rounded-[16px] mt-4 sm:mt-6"
              />
            </div>
          </div>

          {/* Donations */}
          <div className="bg-[#4CAF50] rounded-[20px] sm:rounded-[24px] px-3 sm:px-2 pt-5 sm:pt-6 pb-2 flex flex-col">
            <div className="pl-3 sm:pl-4">
              <div className="flex justify-between items-start">
                <h3 className="text-[24px] sm:text-[32px] font-bold text-white">Donations</h3>
                <span className="border-2 border-white/40 text-white text-xs sm:text-sm font-semibold w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">03</span>
              </div>
              <p className="mt-2 text-white font-semibold text-sm sm:text-base">Support NGOs</p>
              <p className="mt-2 text-white/80 text-xs sm:text-sm">Donate to trusted organizations working for climate and social causes.</p>
            </div>
            <div className="mt-auto">
              <img
                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=200&fit=crop"
                alt="Donations"
                className="w-full h-[180px] sm:h-[250px] object-cover rounded-[12px] sm:rounded-[16px] mt-4 sm:mt-6"
              />
            </div>
          </div>

          {/* Education */}
          <div className="bg-[#E91E63] rounded-[20px] sm:rounded-[24px] px-3 sm:px-2 pt-5 sm:pt-6 pb-2 flex flex-col">
            <div className="pl-3 sm:pl-4">
              <div className="flex justify-between items-start">
                <h3 className="text-[24px] sm:text-[32px] font-bold text-white">Education</h3>
                <span className="border-2 border-white/40 text-white text-xs sm:text-sm font-semibold w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">04</span>
              </div>
              <p className="mt-2 text-white font-semibold text-sm sm:text-base">Learn & Share</p>
              <p className="mt-2 text-white/80 text-xs sm:text-sm">Access resources about climate change, sustainability, and social impact.</p>
            </div>
            <div className="mt-auto">
              <img
                src="/uploads/education.jpg"
                alt="Education - Nepal Village Students"
                className="w-full h-[180px] sm:h-[250px] object-cover rounded-[12px] sm:rounded-[16px] mt-4 sm:mt-6"
              />
            </div>
          </div>

          {/* Waste Management */}
          <div className="bg-[#1a237e] rounded-[20px] sm:rounded-[24px] px-3 sm:px-2 pt-5 sm:pt-6 pb-2 flex flex-col">
            <div className="pl-3 sm:pl-4">
              <div className="flex justify-between items-start">
                <h3 className="text-[24px] sm:text-[32px] font-bold text-white">Waste Management</h3>
                <span className="border-2 border-white/40 text-white text-xs sm:text-sm font-semibold w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">05</span>
              </div>
              <p className="mt-2 text-white font-semibold text-sm sm:text-base">Reduce & Recycle</p>
              <p className="mt-2 text-white/80 text-xs sm:text-sm">Learn proper waste disposal and support recycling initiatives.</p>
            </div>
            <div className="mt-auto">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=200&fit=crop"
                alt="Waste Management"
                className="w-full h-[180px] sm:h-[250px] object-cover rounded-[12px] sm:rounded-[16px] mt-4 sm:mt-6"
              />
            </div>
          </div>

          {/* Food */}
          <div className="bg-[#2196F3] rounded-[20px] sm:rounded-[24px] px-3 sm:px-2 pt-5 sm:pt-6 pb-2 flex flex-col">
            <div className="pl-3 sm:pl-4">
              <div className="flex justify-between items-start">
                <h3 className="text-[24px] sm:text-[32px] font-bold text-white">Food</h3>
                <span className="border-2 border-white/40 text-white text-xs sm:text-sm font-semibold w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">06</span>
              </div>
              <p className="mt-2 text-white font-semibold text-sm sm:text-base">Share & Survive</p>
              <p className="mt-2 text-white/80 text-xs sm:text-sm">Help fight hunger by sharing food with those in need.</p>
            </div>
            <div className="mt-auto">
              <img
                src="/uploads/food.avif"
                alt="Food - Nepal Food Poverty"
                className="w-full h-[180px] sm:h-[250px] object-cover rounded-[12px] sm:rounded-[16px] mt-4 sm:mt-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 sm:mt-20">
        <h2 className="text-[28px] sm:text-[36px] lg:text-[48px] font-bold text-brand-dark mb-8 sm:mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-border-default rounded-[12px] sm:rounded-[16px] overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left bg-surface hover:bg-surface-alt transition-colors"
              >
                <span className="font-semibold text-sm sm:text-base text-brand-dark pr-4">{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-text-secondary transition-transform flex-shrink-0 ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-text-secondary bg-surface">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Impact Stories Section */}
      <div className="mt-12 sm:mt-20">
        <h2 className="text-[28px] sm:text-[36px] lg:text-[48px] font-bold text-brand-dark mb-3 sm:mb-4">
          Impact Stories,<br />Real Change.
        </h2>
        <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8">
          See how climate change is impacting us.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            "Agh0hRymp5E",
            "2rvfYSwQ1vM",
            "zpdExnNQcWg",
          ].map((videoId) => (
            <div
              key={videoId}
              className="relative rounded-[16px] sm:rounded-[20px] overflow-hidden aspect-video bg-gray-900"
            >
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Climate Impact Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>


      </div>

      {/* Get in Touch Section */}
      <div id="contact" className="mt-12 sm:mt-20 bg-accent/10 rounded-[20px] sm:rounded-[28px] p-5 sm:p-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&h=500&fit=crop"
              alt="Children"
              className="rounded-[16px] sm:rounded-[20px] w-full h-[250px] sm:h-[350px] lg:h-[400px] object-cover"
            />
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-surface rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-text-secondary">Email us at</p>
                <p className="text-xs sm:text-sm font-semibold text-text-primary">support@sewago.org</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-brand-dark">
              Get in Touch With Us
            </h2>
            <p className="mt-2 text-sm sm:text-base text-text-secondary">We're here to listen, support, and collaborate.</p>
            <p className="mt-1 text-sm sm:text-base text-text-secondary">Donor, partner, or volunteer? Share your message, and we'll reply in 3 days.</p>
            <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-[10px] sm:rounded-[12px] border border-border-default focus:outline-none focus:border-green-500 bg-surface text-sm sm:text-base"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-[10px] sm:rounded-[12px] border border-border-default focus:outline-none focus:border-green-500 bg-surface text-sm sm:text-base"
                />
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-[10px] sm:rounded-[12px] border border-border-default focus:outline-none focus:border-green-500 bg-surface text-sm sm:text-base"
                />
              </div>
              <textarea
                placeholder="Tell us about your request or idea..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={4}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-[10px] sm:rounded-[12px] border border-border-default focus:outline-none focus:border-green-500 bg-surface resize-none text-sm sm:text-base"
              />
              <button
                type="submit"
                disabled={formStatus === "sending"}
                className="bg-green-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-[10px] sm:rounded-[12px] font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2 text-sm sm:text-base"
              >
                {formStatus === "sending" ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : formStatus === "success" ? (
                  "✓ Sent Successfully"
                ) : (
                  "Submit"
                )}
              </button>
              {formStatus === "error" && (
                <p className="text-red-500 text-xs sm:text-sm">Failed to send. Please try again or email us directly.</p>
              )}
            </form>
          </div>
        </div>
      </div>

      </div>

      {/* Footer */}
      <footer className="mt-12 sm:mt-16 bg-accent rounded-[20px] sm:rounded-[28px] p-6 sm:p-12 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full">
                <img src="/logo.png" alt="SewaGo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-brand-dark">SewaGo</h3>
                <p className="text-[10px] sm:text-xs text-text-secondary">Social Service Platform</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-brand-dark mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-text-secondary text-xs sm:text-sm">
              <li><a href="/marketplace" className="hover:text-brand-dark transition-colors">Marketplace</a></li>
              <li><a href="/events" className="hover:text-brand-dark transition-colors">Events</a></li>
              <li><a href="/about" className="hover:text-brand-dark transition-colors">About Us</a></li>
              <li><a href="/#contact" className="hover:text-brand-dark transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-brand-dark mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-text-secondary text-xs sm:text-sm">
              <li><a href="#" className="hover:text-brand-dark transition-colors">Climate Change</a></li>
              <li><a href="#" className="hover:text-brand-dark transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-brand-dark transition-colors">Waste Management</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-brand-dark mb-3 sm:mb-4 text-sm sm:text-base">Contact Us</h4>
            <p className="font-bold text-brand-dark text-sm sm:text-base">SewaGo Team</p>
            <p className="text-text-secondary mt-1 sm:mt-2 text-xs sm:text-sm">Kathmandu, Tokha</p>
            <p className="text-text-secondary text-xs sm:text-sm">support@sewago.org</p>
            <p className="text-text-secondary text-xs sm:text-sm">+9779868597841</p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex items-center gap-2.5 sm:gap-4">
          <a href="#" className="w-7 h-7 sm:w-10 sm:h-10 bg-brand-dark rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[18px] sm:h-[18px]">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
          <a href="#" className="w-7 h-7 sm:w-10 sm:h-10 bg-brand-dark rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[18px] sm:h-[18px]">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="#" className="w-7 h-7 sm:w-10 sm:h-10 bg-brand-dark rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[18px] sm:h-[18px]">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </a>
          <a href="#" className="w-7 h-7 sm:w-10 sm:h-10 bg-brand-dark rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[18px] sm:h-[18px]">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
          </a>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-300 flex flex-col sm:flex-row justify-between items-center gap-2 text-text-secondary text-xs sm:text-sm">
          <p>© 2025 SewaGo. All Rights Reserved.</p>
          <p>Crafted by <span className="font-semibold">Solves Lab</span></p>
        </div>
      </footer>

      {showDonateModal && (
        <DonateModal onClose={() => setShowDonateModal(false)} />
      )}

    </div>
  );
}
