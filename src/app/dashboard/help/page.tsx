"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, MessageSquare, BookOpen, Shield, CreditCard,
  Users, Settings, ChevronDown, ChevronUp, ArrowRight,
  Mail, Phone, FileText, Zap, HelpCircle, Lightbulb,
  Star, Clock, CheckCircle2, X, Send, ExternalLink,
} from "lucide-react";

const categories = [
  { icon: BookOpen, title: "Getting Started", desc: "Learn the basics of SewaGo", count: 13, color: "from-blue-50 to-blue-100", keywords: ["getting started", "setup", "begin", "new", "account", "register", "signup", "verify", "verified"] },
  { icon: CreditCard, title: "Payments & Billing", desc: "Manage transactions and wallets", count: 8, color: "from-green-50 to-green-100", keywords: ["payment", "wallet", "money", "transfer", "billing", "usd", "eur", "gbp", "balance"] },
  { icon: Shield, title: "Safety & Privacy", desc: "Keep your account secure", count: 10, color: "from-purple-50 to-purple-100", keywords: ["safety", "privacy", "security", "password", "secure", "data"] },
  { icon: Users, title: "Community", desc: "Marketplace, events, and more", count: 19, color: "from-orange-50 to-orange-100", keywords: ["community", "marketplace", "event", "listing", "exchange", "giveaway", "request", "rsvp", "donate", "donation"] },
  { icon: Settings, title: "Account Settings", desc: "Profile, notifications, preferences", count: 8, color: "from-gray-50 to-gray-100", keywords: ["settings", "profile", "notification", "preference", "theme", "appearance", "toggle"] },
  { icon: MessageSquare, title: "Messaging", desc: "Chat, media sharing, notifications", count: 6, color: "from-pink-50 to-pink-100", keywords: ["message", "chat", "image", "media", "send", "conversation", "inbox"] },
];

const allArticles = [
  { title: "How to create your first listing", category: "Community", time: "3 min read", content: "Navigate to Marketplace and click '+ Post Listing'. Choose your listing type: Exchange, Giveaway, or Request. Fill in the title, description, and category. Add up to 4 photos to make your listing stand out. Preview your listing before publishing, then hit 'Post' to make it live. Your listing will appear in the marketplace instantly for others to browse." },
  { title: "Setting up your payment wallet", category: "Payments & Billing", time: "5 min read", content: "Go to your Dashboard to see your current wallet balances. SewaGo supports USD, EUR, and GBP wallets. To add funds, click 'Transfer' on your balance card. You can move money between wallets using the 'Request' feature. All transactions are secure and processed instantly. Track your spending and income from the dashboard charts." },
  { title: "Understanding item exchange process", category: "Community", time: "4 min read", content: "Browse the Marketplace and find an item you'd like to exchange. Click 'Swap' on the listing to make an offer. Describe what you're offering in return and add photos if possible. The other party will receive a notification and can accept or decline. Once both agree, coordinate the exchange details through the messaging system. Meet safely and complete the swap!" },
  { title: "How to RSVP for events", category: "Community", time: "2 min read", content: "Visit the Events page to browse upcoming events. Filter by category: Education, Technology, Health, Community, Sports, Arts, Business, or Social. Click on an event to see full details including date, time, location, and description. Hit the RSVP button to confirm your attendance. You'll receive reminders before the event. Share events with friends using the share button." },
  { title: "Privacy settings explained", category: "Safety & Privacy", time: "6 min read", content: "Go to Settings > Privacy to control your visibility. Toggle 'Public profile' to decide if others can find you. Control whether your email and phone are visible. Enable or disable 'Online status' so others know when you're active. Turn 'Read receipts' on or off for messages. Your data is encrypted and never shared with third parties. You can deactivate or delete your account anytime from the Danger Zone." },
  { title: "Troubleshooting login issues", category: "Getting Started", time: "3 min read", content: "If you can't log in, first check that your email and password are correct. Make sure Caps Lock is off. If you forgot your password, use the 'Forgot Password' link on the login page. Check your email for the OTP code. If you're still having trouble, try clearing your browser cache. For persistent issues, contact support through the Help page." },
  { title: "How to message other users", category: "Messaging", time: "2 min read", content: "Find a user you want to message from their listing or profile. Click 'Message' to open a conversation. Type your message and press Enter or click Send. You can attach images using the paperclip icon. Messages are delivered instantly and you'll see when they're read. The conversation list on the left shows all your chats with the latest message preview." },
  { title: "Customizing your profile", category: "Account Settings", time: "4 min read", content: "Visit Settings > Profile to update your information. Change your profile photo by clicking the camera icon. Edit your name, phone, and location fields. Write a bio to tell others about yourself. Changes save automatically. Your profile is visible to other users based on your Privacy settings. Keep your information up to date for the best experience." },
];

const allFaqs = [
  { q: "How do I create a listing on the marketplace?", a: "Navigate to Marketplace and click '+ Post Listing'. Fill in the title, description, category, and add photos. Choose your listing type: Exchange, Giveaway, or Request. Your listing will be visible to the community instantly.", category: "Community" },
  { q: "How does the exchange process work?", a: "When you find something you'd like to exchange, click 'Swap' on the listing. Propose what you're offering in return with a message. The other party can accept or decline. Once both agree, coordinate the exchange through messaging.", category: "Community" },
  { q: "Is my personal information safe?", a: "We take privacy seriously. Your email and phone are only visible if you choose to show them in Settings > Privacy. All data is encrypted, and we never share your information with third parties. You can deactivate or delete your account anytime.", category: "Safety & Privacy" },
  { q: "How do I add images to my messages?", a: "In the chat window, click the attachment icon (paperclip or image icon) next to the message input. Select an image from your device, preview it, and send. Images display inline in the conversation.", category: "Messaging" },
  { q: "Can I edit or delete my listing after posting?", a: "Yes. On your listing, click the three-dot menu (owner only). You can Edit to modify details or Delete to remove it permanently. Only the original poster can manage their listings.", category: "Community" },
  { q: "How do event RSVPs work?", a: "Browse events on the Events page, filter by category, and click into one you like. Hit RSVP to confirm attendance. You'll receive reminders before the event. You can also share events with others.", category: "Community" },
  { q: "What payment methods are supported?", a: "SewaGo supports multiple wallets including USD, EUR, and GBP. You can transfer funds between wallets and use them for marketplace transactions. All payments are processed securely.", category: "Payments & Billing" },
  { q: "How do I change my theme or appearance?", a: "Go to Settings > Appearance. Choose between Light and Dark themes, select an accent color, and adjust font size. Changes apply instantly and persist across sessions.", category: "Account Settings" },
  { q: "How do I reset my password?", a: "On the login page, click 'Forgot Password'. Enter your email address and we'll send you an OTP code. Enter the code on the verification page and create a new password. You'll be logged in automatically after resetting.", category: "Getting Started" },
  { q: "Can I have multiple listings at once?", a: "Yes! There's no limit to how many listings you can create. Each listing can have a different type (Exchange, Giveaway, Request) and category. Manage all your listings from your profile or the Marketplace page.", category: "Community" },
  { q: "How do I make a donation?", a: "Click the Donate button on the dashboard or homepage. Enter your name, email, and donation amount in Nepali Rupees. Upload a screenshot of your payment, then submit. Our team will verify your payment and notify you once confirmed.", category: "Community" },
  { q: "What types of listings can I create on the marketplace?", a: "You can create three types of listings — Exchange (swap items with someone), Giveaway (offer items for free), and Request (ask for something you need). Each listing supports multiple photos, a description, and category tagging.", category: "Community" },
  { q: "How do I create an event?", a: "Go to the Events page and click '+ Create Event'. Fill in the title, description, category, date, time, and location. You can also add images and set a max attendee limit. Your event will appear in the Events feed for others to RSVP.", category: "Community" },
  { q: "What event categories are available?", a: "Events can be tagged as Education, Technology, Health & Wellness, Community, Sports, Arts & Culture, Business, or Social. Browse by category to find events that interest you.", category: "Community" },
  { q: "How do I get my account verified?", a: "Go to your Profile and submit your details including a valid ID card (passport, national ID, or driving license). Our team reviews submissions within 24-48 hours. Verified users get a badge and full access to post listings, create events, and donate.", category: "Getting Started" },
  { q: "How do notifications work?", a: "You receive notifications for new messages, offers on your listings, event updates, and donation confirmations. Check the bell icon in the navbar to view all notifications.", category: "Account Settings" },
];

const steps = [
  { icon: CheckCircle2, title: "Search or Browse", desc: "Find answers in our help articles" },
  { icon: CheckCircle2, title: "Follow a Guide", desc: "Step-by-step instructions for any task" },
  { icon: CheckCircle2, title: "Get Support", desc: "Contact our team if you need more help" },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<typeof allArticles[0] | null>(null);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
  const [contactMsg, setContactMsg] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);

  const q = search.toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q))
    );
  }, [q]);

  const filteredArticles = useMemo(() => {
    let list = allArticles;
    if (activeCategory) {
      list = list.filter((a) => a.category === activeCategory);
    }
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      );
    }
    return list;
  }, [q, activeCategory]);

  const filteredFaqs = useMemo(() => {
    let list = allFaqs;
    if (activeCategory) {
      list = list.filter((f) => f.category === activeCategory);
    }
    if (q) {
      list = list.filter(
        (f) =>
          f.q.toLowerCase().includes(q) ||
          f.a.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [q, activeCategory]);

  const handleContact = () => {
    if (!contactName || !contactEmail || !contactMsg) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setShowContactForm(false);
      setContactName("");
      setContactEmail("");
      setContactMsg("");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-8 py-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Hero */}
      <div className="rounded-[24px] bg-gradient-to-br from-[#1D1B17] to-[#2a2824] p-10 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
            <Zap size={14} className="text-accent" />
            Help Center
          </div>
          <h1 className="text-2xl lg:text-4xl font-normal mb-3">How can we help you?</h1>
          <p className="text-lg text-white/60 mb-8">Search our guides, FAQs, and tutorials to find what you need.</p>
          <div className="relative mx-auto max-w-xl">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for help..."
              className="w-full rounded-full bg-white py-4 pl-14 pr-12 text-lg text-text-primary outline-none placeholder:text-text-muted"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setActiveCategory(null); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
          {(search || activeCategory) && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/50">
              <span>
                {filteredArticles.length + filteredFaqs.length} results
                {search && ` for "${search}"`}
                {activeCategory && ` in ${activeCategory}`}
              </span>
              <button
                onClick={() => { setSearch(""); setActiveCategory(null); }}
                className="text-accent hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      {!search && !activeCategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4 rounded-[24px] bg-surface p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                <step.icon size={22} className="text-text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">{step.title}</p>
                <p className="text-base text-text-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories */}
      {filteredCategories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-normal text-text-primary">Browse by Topic</h2>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Show all topics
              </button>
            )}
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredCategories.map((cat) => (
              <button
                key={cat.title}
                onClick={() => setActiveCategory(activeCategory === cat.title ? null : cat.title)}
                className={`flex items-center gap-4 rounded-[24px] p-6 text-left transition-all shadow-sm ${
                  activeCategory === cat.title
                    ? "bg-white/70 backdrop-blur-md border border-white/50 shadow-lg"
                    : "bg-surface hover:shadow-md"
                }`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  activeCategory === cat.title ? "bg-accent/30" : `bg-gradient-to-br ${cat.color}`
                }`}>
                  <cat.icon size={24} className="text-text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-text-primary">{cat.title}</p>
                  <p className="text-base text-text-muted">{cat.desc}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                  activeCategory === cat.title
                    ? "bg-nav-active text-white"
                    : "bg-border-light text-text-secondary"
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Articles */}
      <div>
        <h2 className="text-2xl font-normal text-text-primary mb-5">
          {activeCategory ? `${activeCategory} Articles` : "Popular Articles"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {filteredArticles.length === 0 ? (
            <div className="col-span-2 rounded-[24px] bg-surface py-12 text-center shadow-sm">
              <HelpCircle size={48} strokeWidth={1} className="mx-auto text-text-muted" />
              <p className="mt-4 text-lg font-medium text-text-muted">No articles found</p>
              <p className="text-base text-text-muted">Try a different search term</p>
            </div>
          ) : (
            filteredArticles.map((article, i) => (
              <div
                key={i}
                onClick={() => setSelectedArticle(article)}
                className="group flex items-center justify-between rounded-[20px] bg-surface p-5 shadow-sm transition-all hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-border-light">
                    <FileText size={18} className="text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-text-primary group-hover:text-nav-active">{article.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-text-muted">{article.category}</span>
                      <span className="text-[#D0D0D0]">·</span>
                      <span className="flex items-center gap-1 text-sm text-text-muted">
                        <Clock size={12} />
                        {article.time}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-text-muted group-hover:text-text-primary transition-colors" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-normal text-text-primary mb-5">Frequently Asked Questions</h2>
        <div className="rounded-[24px] bg-surface shadow-sm overflow-hidden">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center">
              <HelpCircle size={48} strokeWidth={1} className="mx-auto text-text-muted" />
              <p className="mt-4 text-lg font-medium text-text-muted">No results found</p>
              <p className="text-base text-text-muted">Try a different search term</p>
            </div>
          ) : (
            filteredFaqs.map((faq, i) => (
              <div key={i} className="border-b border-border-light last:border-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-surface-alt"
                >
                  <span className="text-lg font-medium text-text-primary pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={20} className="flex-shrink-0 text-text-muted" />
                  ) : (
                    <ChevronDown size={20} className="flex-shrink-0 text-text-muted" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-base leading-relaxed text-text-secondary">{faq.a}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="rounded-[24px] bg-surface p-8 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-normal text-text-primary mb-2">Still need help?</h2>
          <p className="text-lg text-text-muted">Our support team is here for you. Reach out anytime.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <button
            onClick={() => setShowContactForm(true)}
            className="flex flex-col items-center gap-4 rounded-[20px] border border-border-default p-6 transition-all hover:border-gray-300 hover:shadow-sm cursor-pointer text-left"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20">
              <Mail size={24} className="text-text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-text-primary">Email Us</p>
              <p className="text-base text-text-muted mt-1">support@sewago.com</p>
              <p className="text-sm text-text-muted mt-1">Reply within 24 hours</p>
            </div>
          </button>
          <Link
            href="/dashboard/messages"
            className="flex flex-col items-center gap-4 rounded-[20px] border border-border-default p-6 transition-all hover:border-gray-300 hover:shadow-sm cursor-pointer text-left"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20">
              <MessageSquare size={24} className="text-text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-text-primary">Live Chat</p>
              <p className="text-base text-text-muted mt-1">Chat with our team</p>
              <p className="text-sm text-text-muted mt-1 flex items-center justify-center gap-1">
                Go to Messages <ExternalLink size={12} />
              </p>
            </div>
          </Link>
          <a
            href="tel:+97714000000"
            className="flex flex-col items-center gap-4 rounded-[20px] border border-border-default p-6 transition-all hover:border-gray-300 hover:shadow-sm cursor-pointer text-left"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20">
              <Phone size={24} className="text-text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-text-primary">Call Us</p>
              <p className="text-base text-text-muted mt-1">+977-1-4XXXXXX</p>
              <p className="text-sm text-text-muted mt-1">Mon - Fri, 9am - 5pm</p>
            </div>
          </a>
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-[24px] bg-gradient-to-r from-accent/20 to-accent/5 p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={22} className="text-text-primary" />
              <h3 className="text-xl font-semibold text-text-primary">Was this helpful?</h3>
            </div>
            <p className="text-lg text-text-secondary">
              {feedback ? "Thanks for your feedback!" : "Let us know how we can improve the Help Center."}
            </p>
          </div>
          <div className="flex gap-3">
            {feedback ? (
              <div className="flex items-center gap-2 rounded-full bg-surface px-6 py-3 text-lg font-medium text-text-primary">
                <CheckCircle2 size={18} className="text-green-500" />
                {feedback === "yes" ? "Glad it helped!" : "We'll improve this"}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setFeedback("yes")}
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-surface px-6 py-3 text-lg font-medium text-text-primary transition-colors hover:bg-surface-alt"
                >
                  <Star size={18} />
                  Yes
                </button>
                <button
                  onClick={() => setFeedback("no")}
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-surface px-6 py-3 text-lg font-medium text-text-primary transition-colors hover:bg-surface-alt"
                >
                  <Star size={18} />
                  No
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedArticle(null)} />
          <div className="relative mx-4 w-full max-w-2xl rounded-[24px] bg-surface p-8 shadow-2xl">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-border-light text-text-secondary hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="rounded-full bg-border-light px-3 py-1 text-sm font-medium text-text-secondary">
                {selectedArticle.category}
              </span>
              <span className="flex items-center gap-1 text-sm text-text-muted">
                <Clock size={12} />
                {selectedArticle.time}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">{selectedArticle.title}</h2>
            <p className="text-base leading-relaxed text-text-secondary mb-6">{selectedArticle.content}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border-light">
              <span className="text-sm text-text-muted">Was this article helpful?</span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-text-primary"
              >
                Yes, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowContactForm(false); setContactSent(false); }} />
          <div className="relative mx-4 w-full max-w-lg rounded-[24px] bg-surface p-8 shadow-2xl">
            <button
              onClick={() => { setShowContactForm(false); setContactSent(false); }}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-border-light text-text-secondary hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
            {contactSent ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Message Sent!</h3>
                <p className="text-base text-text-muted">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-text-primary mb-1">Contact Support</h3>
                <p className="text-base text-text-muted mb-6">Send us a message and we&apos;ll respond as soon as possible.</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-base font-medium text-text-muted">Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-full border border-border-default px-5 py-3 text-base text-text-primary outline-none placeholder:text-[#B0B0B0] hover:border-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-base font-medium text-text-muted">Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-full border border-border-default px-5 py-3 text-base text-text-primary outline-none placeholder:text-[#B0B0B0] hover:border-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-base font-medium text-text-muted">Message</label>
                    <textarea
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      placeholder="Describe your issue or question..."
                      rows={4}
                      className="w-full rounded-2xl border border-border-default px-5 py-3 text-base text-text-primary outline-none resize-none placeholder:text-[#B0B0B0] hover:border-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
                    />
                  </div>
                  <button
                    onClick={handleContact}
                    disabled={!contactName || !contactEmail || !contactMsg}
                    className="w-full rounded-full bg-accent px-6 py-3 text-base font-semibold text-text-primary disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    Send Message
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
