import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Database, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
        </div>

        {/* Header Title Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <Badge variant="indigo">Compliance & Security</Badge>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
                Privacy Policy
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Last Updated: October 17, 2026 • Effective Immediately
          </p>
        </div>

        {/* Content Document */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm">
          
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-600" /> 1. Commitment to User Privacy
            </h2>
            <p>
              SkillMatch AI ("we", "our", or "the platform") is committed to safeguarding your personal data and professional career documents. This Privacy Policy details how we handle the information you provide when using our AI resume analysis, skill gap assessment, and job matching services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-600" /> 2. Information We Collect
            </h2>
            <p className="mb-3">We collect information strictly necessary to provide intelligent career analysis:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Account Credentials:</strong> Name, email address, and encrypted hashed passwords for authentication.</li>
              <li><strong>Resume Content:</strong> Professional documents uploaded (.pdf, .docx, .txt), including work history, technical skills, education, and project descriptions.</li>
              <li><strong>Target Job Descriptions:</strong> Job requirements provided by you to calculate comparative ATS match scores.</li>
              <li><strong>Assessment Records:</strong> Quiz answers and mock interview performance metrics stored to track career progression.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-600" /> 3. How We Process Data with Generative AI
            </h2>
            <p className="mb-3">
              SkillMatch AI leverages Google Gemini LLMs to parse and analyze unstructured resume text.
            </p>
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/80 rounded-2xl p-4 space-y-2 text-indigo-950 dark:text-indigo-100">
              <div className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Zero Training Retention Guarantee
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                Your uploaded resume text and job descriptions sent to the Google Gemini API are processed ephemerally. They are <strong>never</strong> used to train, retrain, or improve public foundational AI models.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              4. Data Storage & Security Controls
            </h2>
            <p>
              All data at rest is stored in secure database instances protected by industry-standard access control lists and encrypted with AES-256 encryption. Communications between your browser and our Spring Boot servers are strictly encrypted via TLS 1.3.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-rose-600" /> 5. Your Right to Delete Data
            </h2>
            <p className="mb-3">
              You own your career data. At any time, you can navigate to the Settings panel in your Dashboard to purge past uploaded resumes, reset match scores, or permanently delete your account.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/settings')}
              className="text-xs"
            >
              Open Data Management Settings
            </Button>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              6. Contact Our Privacy Team
            </h2>
            <p className="text-xs text-slate-600">
              For any questions regarding GDPR, CCPA, or data handling practices, please submit an inquiry via our <button onClick={() => navigate('/help')} className="text-indigo-600 hover:underline font-semibold">Help Center</button> or email privacy@skillmatchai.com.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
