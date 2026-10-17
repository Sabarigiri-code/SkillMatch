import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Sparkles, Clock, ArrowRight, 
  Search, CheckCircle2, TrendingUp, X
} from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';

const Blog = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingArticle, setReadingArticle] = useState(null);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const articles = [
    {
      id: 1,
      title: "How Modern Applicant Tracking Systems (ATS) Score Resumes in 2026",
      category: "ATS Optimization",
      date: "October 14, 2026",
      readTime: "6 min read",
      author: "Alex Rivera",
      role: "Lead Career Systems Architect",
      summary: "Modern ATS platforms have evolved from naive regex keyword scanners to semantic LLM classifiers. Learn what algorithms prioritize and how to format your experience.",
      content: `The modern Applicant Tracking System (ATS) landscape in 2026 is vastly different from the rudimentary keyword counters of five years ago. 

### 1. Semantic Embedding over Keyword Stuffing
Older systems relied on basic regex counts (e.g., how many times "Kubernetes" was mentioned). Today's enterprise ATS tools utilize transformer-based sentence embeddings. They evaluate the context in which a tool was applied. For instance:
- "Collaborated with the team on Kubernetes" yields a lower relevance score than:
- "Architected and deployed 40+ microservices on AWS EKS using Helm, reducing deployment rollback frequency by 48%."

### 2. Standardized Section Headings
Even with advanced parsing engines, irregular headings (like "My Journey" or "Things I've Built") confuse document structure parsers. Always stick to predictable standards:
- Work Experience
- Technical Skills
- Education
- Certifications & Projects

### 3. Formatting Rules That Preserve Extraction Accuracy
Avoid multi-column tables, text boxes, and complex graphical charts in your primary PDF. Single-column, clear typography ensures 100% data extraction into automated recruiter pipelines.`
    },
    {
      id: 2,
      title: "Closing the Mid-to-Senior Skill Gap: A Practical Engineer's Playbook",
      category: "Career Growth",
      date: "October 02, 2026",
      readTime: "8 min read",
      author: "Priya Sharma",
      role: "Senior Engineering Director",
      summary: "The step from writing clean code to designing resilient distributed systems and driving architectural decisions is where most engineers hit a ceiling. Here is how to break through.",
      content: `The difference between a mid-level engineer and a senior staff engineer rarely comes down to syntax speed. It is defined by ownership, risk mitigation, and cross-functional leadership.

### The Three Pillars of Seniority:
1. **System Design & Tradeoffs:** Knowing not just how to implement Kafka or Redis, but why you would choose one over PostgreSQL CDC or SQS given specific latency and throughput constraints.
2. **Mentorship & Code Quality Standards:** Raising the engineering floor across your squad through rigorous code reviews and reusable architectural patterns.
3. **Business Alignment:** Translating business OKRs into crisp technical roadmaps.`
    },
    {
      id: 3,
      title: "Mastering AI-Powered Technical Interviews: Prompts, Rubrics & Practice",
      category: "Interview Prep",
      date: "September 24, 2026",
      readTime: "5 min read",
      author: "David Chen",
      role: "Staff Tech Recruiter",
      summary: "How to use SkillMatch AI's interview prep simulator to practice behavioral STAR responses and live system architecture questions with instant feedback.",
      content: `Practicing interviews out loud with realistic simulated pressure is the single highest-ROI activity an engineer can undertake prior to an onsite loop.

### How to Structure Your Answers:
- **Situation:** State the challenge and scale (e.g. 100k daily active users).
- **Task:** Clarify your exact responsibility.
- **Action:** Highlight technical choices, algorithms, or refactoring steps you personally orchestrated.
- **Result:** Quantify the metrics (latency dropped from 400ms to 95ms).`
    },
    {
      id: 4,
      title: "The Shift from Keyword Stuffing to Semantic Competency in Tech Hiring",
      category: "AI Tech",
      date: "September 11, 2026",
      readTime: "7 min read",
      author: "Marcus Vance",
      role: "AI Research Scientist",
      summary: "Why recruiters are ignoring over-stuffed skill lists and relying on AI match summaries that verify genuine project involvement.",
      content: `Listing 60 technologies at the bottom of a two-page resume is no longer effective. Modern hiring managers and automated agents parse semantic relationships between your listed skills and the accomplishments detailed in your bullet points.`
    },
    {
      id: 5,
      title: "Building a Personalized Learning Roadmap That Actually Sticks",
      category: "Career Growth",
      date: "August 29, 2026",
      readTime: "6 min read",
      author: "Elena Rostov",
      role: "Curriculum Engineer",
      summary: "Tutorial paralysis is real. Discover how to transform high-level missing skills into weekly milestone projects with testable outcomes.",
      content: `When transitioning to new tech stacks like Spring Boot or React 19, reading documentation without building a tangible deliverable yields low retention. Structure your learning into 1-week deliverables with tangible project endpoints.`
    }
  ];

  const categories = ['All', 'ATS Optimization', 'Career Growth', 'Interview Prep', 'AI Tech'];

  const filteredArticles = articles.filter(a => {
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setEmailSubscribed(true);
      setTimeout(() => setEmailSubscribed(false), 5000);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      {/* Blog Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-4 uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> Career & Engineering Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            SkillMatch AI Insights & Blog
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Actionable strategies on modern ATS optimization, closing tech skill gaps, mastering AI mock interviews, and navigating high-growth engineering careers.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Featured Article */}
      {selectedCategory === 'All' && !searchQuery && articles[0] && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl border border-slate-800">
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full border border-indigo-400/30">
                  FEATURED ARTICLE
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {articles[0].readTime}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold mb-4 leading-tight">
                {articles[0].title}
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-6">
                {articles[0].summary}
              </p>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => setReadingArticle(articles[0])}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  Read Full Guide
                </Button>
                <span className="text-xs text-slate-400">By {articles[0].author} • {articles[0].date}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <div 
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="indigo">{article.category}</Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {article.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3">
                  {article.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">{article.author}</div>
                  <div className="text-[11px] text-slate-400">{article.date}</div>
                </div>
                <button
                  onClick={() => setReadingArticle(article)}
                  className="text-indigo-600 hover:text-indigo-700 text-xs font-bold inline-flex items-center gap-1"
                >
                  Read <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xs">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Subscribe to SkillMatch AI Digest</h3>
          <p className="text-sm text-slate-600 mb-6 max-w-lg mx-auto">
            Get bi-weekly career strategies, updated ATS scoring breakdowns, and high-demand skill maps sent directly to your inbox.
          </p>
          {emailSubscribed ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Thank you for subscribing! We'll keep you updated.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                required
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button type="submit" className="whitespace-nowrap">
                Subscribe Free
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Article Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <Badge variant="indigo">{readingArticle.category}</Badge>
                <div className="text-xs text-slate-400 mt-1">{readingArticle.readTime} • {readingArticle.date}</div>
              </div>
              <button 
                onClick={() => setReadingArticle(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                {readingArticle.title}
              </h2>
              <div className="flex items-center gap-3 py-2 border-y border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">{readingArticle.author}</span>
                <span>•</span>
                <span>{readingArticle.role}</span>
              </div>
              <div className="prose prose-slate text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {readingArticle.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setReadingArticle(null)}
              >
                Close Article
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  setReadingArticle(null);
                  navigate('/dashboard/resume');
                }}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Try Resume Scanner
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
