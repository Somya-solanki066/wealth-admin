import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./ContentManager.css";

const AVAILABLE_PAGES = [
  { id: "ssg-landing", label: "SSG Landing Page" },
  { id: "witweb-landing", label: "Witweb Landing Page" },
  { id: "pricing", label: "Pricing Page" },
  { id: "features", label: "Features Page" },
  { id: "dashboard", label: "Dashboard (WIP)" },
  { id: "privacy-policy", label: "Privacy Policy" },
  { id: "terms-of-service", label: "Terms of Service" },
  { id: "refund-policy", label: "Refund Policy" },
  { id: "cookie-policy", label: "Cookie Policy" },
];

const DEFAULT_CONTENT = {
  "ssg-landing": {
    heroBadge: "SSG Blueprint",
    heroTitle: "Write Scripts That Get Produced.",
    heroSubtitle: "Master screenplay and script writing from concept to final draft. Feature films, TV series, audio dramas — and how to get your script into the right hands.",
  },
  "witweb-landing": {
    heroBadge: "Witweb Certification",
    heroTitle: "Write It. Publish It. Earn From It.",
    heroSubtitle: "The complete guide to writing, publishing, and earning from serialized fiction on PocketFM, Dreame, GoodNovel, WebNovel, and 5 more platforms.",
  },
  "pricing": {
    pagePreTitle: "Simple Pricing",
    pageTitleBlack: "Start Free.",
    pageTitleGold: "Upgrade Anytime.",
    pageSubtitle: "Choose the plan that works for you. Cancel anytime. No hidden fees.",
    plan1Name: "Free",
    plan1Price: "₦0",
    plan1Period: "Forever free",
    plan2Name: "6-Month Plan",
    plan2Price: "₦24,900",
    plan2Period: "every 6 months",
    plan3Name: "Yearly Plan",
    plan3Price: "₦49,900",
    plan3Period: "per year",
    monthlyTitle: "Monthly Plan Available Too",
    monthlySubtitle: "Start month by month for just ₦6,900 — cancel anytime."
  },
  "features": {
    heroPreTitle: "Everything You Need",
    heroTitleBlack: "Built for",
    heroTitleGold: "Serious Writers",
    heroSubtitle: "Every tool you need to write, edit, publish, and earn — all in one place. No more switching between apps.",
    feat1Title: "Chapter Analyzer",
    feat1Desc: "Paste your chapter. Select your platform. AI reads it and returns a score, metric breakdown, platform-specific tip, and detailed insight cards.",
    feat2Title: "Smart Edit Suite",
    feat2Desc: "8 AI-powered editing checks: Grammar, Passive Voice, Filler Words, Stronger Verbs, Repetition, Pacing & Flow, Dialogue Quality, Plagiarism.",
    feat3Title: "AI Ghost Writer",
    feat3Desc: "Give us your characters, platform, genre, and what should happen. AI writes a complete, platform-ready chapter for you — 800 to 2,000 words.",
    feat4Title: "Novel Editor",
    feat4Desc: "A clean, distraction-free editor built for serialized fiction. Knows the rules of PocketFM, Dreame, GoodNovel, and 6 more platforms.",
    feat5Title: "Script Editor",
    feat5Desc: "Professional screenplay formatting in Courier Prime. Scene headings, action lines, character, dialogue, parenthetical — all at one tap.",
    feat6Title: "Student Hub",
    feat6Desc: "Study Planner, Flashcards, Citation Generator (APA/MLA/Harvard/Chicago/Vancouver), Essay Writer, Course Videos, Exam Techniques.",
    platformsPreTitle: "Supported Platforms",
    platformsSubtitle: "The Chapter Analyzer gives platform-specific feedback for all 9 platforms",
  },
  "dashboard": {
    sidebarWelcome: "Welcome back",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    body: "Effective Date: January 1, 2026\n\nYour privacy is important to us. This Privacy Policy explains how Ink2Wealth Media Limited collects, uses, and discloses information about you when you access or use our websites and services.\n\n1. Information We Collect\nWe collect information you provide directly to us, such as when you create an account, subscribe to a newsletter, or request support. This may include your name, email address, and payment information.\n\n2. How We Use Your Information\nWe use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you.\n\n3. Contact Us\nIf you have any questions about this Privacy Policy, please contact us at support@ink2wealth.com.",
  },
  "terms-of-service": {
    title: "Terms of Service",
    body: "Effective Date: January 1, 2026\n\nBy accessing or using the Ink2Wealth platform, you agree to be bound by these Terms of Service.\n\n1. Use of Services\nYou must use the services in compliance with all applicable laws and regulations. You are responsible for maintaining the security of your account.\n\n2. Intellectual Property\nAll content provided on the platform, including courses, software, and materials, are the intellectual property of Ink2Wealth Media Limited and are protected by copyright laws.\n\n3. Termination\nWe reserve the right to suspend or terminate your access to the services at any time for violations of these Terms.\n\n4. Contact\nFor inquiries regarding these Terms, contact support@ink2wealth.com.",
  },
  "refund-policy": {
    title: "Refund Policy",
    body: "Effective Date: January 1, 2026\n\nAt Ink2Wealth, we want you to be completely satisfied with your purchase.\n\n1. Course Subscriptions & Digital Products\nWe offer a 7-day money-back guarantee on all our course subscriptions. If you are not satisfied within the first 7 days of purchase, you may request a full refund.\n\n2. How to Request a Refund\nTo request a refund, please email support@ink2wealth.com with your receipt and reason for the request.\n\n3. Exceptions\nNo refunds will be granted after the 7-day period has passed, or if the user has completed more than 50% of the course material.",
  },
  "cookie-policy": {
    title: "Cookie Policy",
    body: "Effective Date: January 1, 2026\n\nInk2Wealth uses cookies to improve your experience on our site.\n\n1. What are Cookies?\nCookies are small text files placed on your device to store data that can be recalled by a web server in the domain that placed the cookie.\n\n2. How We Use Cookies\nWe use cookies to remember your login state, preferences, and to analyze site traffic for performance improvements.\n\n3. Managing Cookies\nYou can control or delete cookies at the browser level. However, if you choose to disable cookies, it may limit your use of certain features or functions on our website.",
  }
};

export default function ContentManager() {
  const [selectedPage, setSelectedPage] = useState(AVAILABLE_PAGES[0].id);
  const [content, setContent] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // New Key state
  const [newKeyName, setNewKeyName] = useState("");

  useEffect(() => {
    fetchContent();
  }, [selectedPage]);

  const fetchContent = async () => {
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await api.get(`/content/${selectedPage}`);
      const fetchedContent = response.data.data || {};
      
      // If DB is empty, use default fields so admin knows what they can edit
      if (Object.keys(fetchedContent).length === 0 && DEFAULT_CONTENT[selectedPage]) {
        setContent(DEFAULT_CONTENT[selectedPage]);
      } else {
        setContent(fetchedContent);
      }
    } catch (error) {
      console.error("Failed to fetch content", error);
      setMessage({ text: "Failed to load content for this page.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setContent((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });
    try {
      await api.put(`/content/${selectedPage}`, {
        content: content
      });
      setMessage({ text: "Content saved successfully!", type: "success" });
    } catch (error) {
      console.error("Failed to save content", error);
      setMessage({ text: "Failed to save content. Please try again.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewKey = () => {
    if (!newKeyName.trim()) return;
    setContent(prev => ({
      ...prev,
      [newKeyName.trim()]: "New Content Here"
    }));
    setNewKeyName("");
  };

  const handleDeleteKey = (key) => {
    if (window.confirm(`Are you sure you want to delete the key "${key}"?`)) {
      const newContent = { ...content };
      delete newContent[key];
      setContent(newContent);
    }
  };

  return (
    <div className="content-manager-container">
      <h2>Page Content Editor</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="content-manager-section selector-section">
        <label>Select Page to Edit:</label>
        <select 
          value={selectedPage} 
          onChange={(e) => setSelectedPage(e.target.value)}
          className="page-select"
        >
          {AVAILABLE_PAGES.map(page => (
            <option key={page.id} value={page.id}>
              {page.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="content-manager-section form-section">
          <h3>Edit Text Content for: {AVAILABLE_PAGES.find(p => p.id === selectedPage)?.label}</h3>
          
          <form onSubmit={handleSave} className="content-form">
            {Object.keys(content).length === 0 ? (
              <p className="empty-state">No content keys found for this page yet. Add one below!</p>
            ) : (
              Object.entries(content).map(([key, value]) => (
                <div key={key} className="form-group-content">
                  <div className="form-group-header">
                    <label>{key}</label>
                    <button type="button" onClick={() => handleDeleteKey(key)} className="delete-key-btn">Delete</button>
                  </div>
                  {/* Simple heuristic: if value is long, use textarea, else input */}
                  {typeof value === 'string' && value.length > 80 ? (
                    <textarea 
                      value={value} 
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <input 
                      type="text" 
                      value={value} 
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                  )}
                </div>
              ))
            )}

            <div className="add-key-section">
              <h4>Add New Field</h4>
              <div className="add-key-inputs">
                <input 
                  type="text" 
                  placeholder="e.g. heroTitle"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <button type="button" onClick={handleAddNewKey} className="add-btn">Add Field</button>
              </div>
            </div>

            <button type="submit" className="save-btn" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
