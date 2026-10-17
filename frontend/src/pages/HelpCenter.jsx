import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, Search, ChevronDown, ChevronUp, 
  Send, CheckCircle2, MessageSquare, Mail, Sparkles
} from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const categories = ['All', 'Resume & Uploads', 'ATS & Scoring', 'Roadmap & Learning', 'Account & Privacy'];

  const faqs = [
    {
      category: 'Resume & Uploads',
      question: "Which file formats are supported for resume upload?",
      answer: "SkillMatch AI supports standard PDF (.pdf), Microsoft Word (.docx), and plain text (.txt) files up to 10MB in size. Single-column layouts with standard headings yield the cleanest parsing results."
    },
    {
      category: 'Resume & Uploads',
      question: "How does SkillMatch AI extract skills from my resume?",
      answer: "We use a hybrid text parsing engine with Apache PDFBox and Google Gemini AI. The document text is extracted and semantically analyzed to identify technical skills, frameworks, cloud tools, soft skills, and years of experience without requiring rigid formatting."
    },
    {
      category: 'ATS & Scoring',
      question: "How is the ATS Match Score calculated?",
      answer: "Our ATS Score is computed on a 0-100 scale using a multi-factor algorithm: Required Hard Skills (40%), Contextual Experience Alignment (30%), Domain Familiarity (20%), and Seniority Relevance (10%). Scores above 80% indicate high alignment with standard recruiter filters."
    },
    {
      category: 'ATS & Scoring',
      question: "What should I do if my ATS score is below 60%?",
      answer: "Navigate to the 'Skill Gap' section to identify missing high-priority keywords and requirements. Then proceed to the 'Learning Roadmap' tab to review recommended actions and integrate missing competencies into your projects."
    },
    {
      category: 'Roadmap & Learning',
      question: "How are the week-by-week learning roadmaps generated?",
      answer: "When you request a roadmap, our Gemini AI engine analyzes your missing and developing skills in relation to the target job description. It structures a progressive 4-8 week curriculum with theoretical concepts, hands-on tasks, and capstone project deliverables."
    },
    {
      category: 'Roadmap & Learning',
      question: "Can I take AI assessments for the skills in my roadmap?",
      answer: "Yes! The 'Skill Assessment' feature generates custom multiple-choice quizzes tailored to your active roadmap topics. You get immediate grading, detailed answer explanations, and performance tracking."
    },
    {
      category: 'Account & Privacy',
      question: "Is my resume data kept private and secure?",
      answer: "Absolutely. Resumes are stored encrypted in your private MongoDB instance and are never shared, sold, or used to train public machine learning models. You can delete your resume data at any time under Settings."
    },
    {
      category: 'Account & Privacy',
      question: "How do I reset my password or update my email?",
      answer: "You can update your profile details and password by navigating to the Settings page in the Dashboard. For email verification and OTP recovery, check your inbox for automated verification codes."
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMessage) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setContactName('');
        setContactEmail('');
        setContactSubject('');
        setContactMessage('');
      }, 6000);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      {/* Hero Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-4 uppercase tracking-wider">
              <HelpCircle className="h-4 w-4" /> 24/7 Knowledge Base & Support
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              How Can We Help You?
            </h1>
            <p className="text-slate-300 text-base md:text-lg mb-8">
              Find instant answers about resume parsing, ATS scoring formulas, roadmap generation, or contact our support team.
            </p>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search questions (e.g. ATS score, PDF format, roadmap)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm bg-white text-slate-900 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-400/30 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: FAQs on Left, Contact on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FAQs List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" /> Frequently Asked Questions
              <span className="text-xs font-normal text-slate-400">({filteredFaqs.length} answers)</span>
            </h2>

            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 mb-1">No matching questions found</h3>
                <p className="text-xs text-slate-500 mb-4">Try searching with different terms or submit a ticket below.</p>
                <Button size="sm" onClick={() => setSearchQuery('')}>Clear Search</Button>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? -1 : index)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="indigo" size="sm">{faq.category}</Badge>
                        <span className="text-sm font-bold text-slate-900">{faq.question}</span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-indigo-600 shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Contact Support Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-2 text-indigo-600">
                <Mail className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-lg">Contact Support</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Have a technical issue or custom integration inquiry? Send a message to our support team and we will respond within 24 hours.
              </p>

              {formSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-bold text-emerald-900 text-sm mb-1">Ticket Submitted!</h4>
                  <p className="text-xs text-emerald-700">
                    Thank you, {contactName}. A support ticket #SM-{Math.floor(1000 + Math.random() * 9000)} has been opened.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email"
                      required
                      placeholder="sarah@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                    <input 
                      type="text"
                      placeholder="Resume Parsing Question"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="Describe what you need help with..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    ></textarea>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-xs font-bold py-2.5"
                    rightIcon={<Send className="h-3.5 w-3.5" />}
                  >
                    Submit Ticket
                  </Button>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Avg response: &lt; 2 hrs</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Support Online
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
