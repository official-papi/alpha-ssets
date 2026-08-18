"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 text-slate-800 flex flex-col font-sans relative overflow-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 pb-20">
        
        {/* Architectural 2-Column Hero */}
        <PageHero
          badge="Direct Investor Support Desk"
          title="Contact Our Institutional"
          titleHighlight="Support & VIP Desk"
          subtitle="Have questions regarding your investments, deposit verification, or technical account assistance? Our support desk is available 24/7."
          icon={MessageSquare}
          breadcrumb="Contact Support"
          stats={[
            { label: "Average Response", value: "< 2 Hours" },
            { label: "Desk Availability", value: "24/7/365" },
            { label: "Ticket Security", value: "Encrypted" },
          ]}
          hudContent={
            <div className="space-y-3 py-1 text-xs font-medium">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="font-extrabold text-slate-900">Current Queue SLA</span>
                </div>
                <span className="font-mono font-extrabold text-emerald-600">~ 12 Mins</span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span className="font-extrabold text-indigo-950">Encrypted Communication</span>
                </div>
                <span className="font-mono font-bold text-indigo-700">AES-256</span>
              </div>
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Left Glass Info Cards */}
            <div className="space-y-4">
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/15 to-blue-500/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 flex items-center space-x-4 shadow-xl shadow-slate-900/5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50/80 border border-indigo-100/80 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Email Direct Support</h4>
                    <p className="text-xs text-slate-500 font-mono">support@hyipmax.io</p>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 flex items-center space-x-4 shadow-xl shadow-slate-900/5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50/80 border border-emerald-100/80 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">24/7 VIP Telephone Line</h4>
                    <p className="text-xs text-slate-500 font-mono">+1 (800) 555-HYIP</p>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/15 to-violet-500/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 flex items-center space-x-4 shadow-xl shadow-slate-900/5">
                  <div className="w-12 h-12 rounded-xl bg-purple-50/80 border border-purple-100/80 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Global Corporate Office</h4>
                    <p className="text-xs text-slate-500 font-medium">75 Wall Street, Financial District, New York, NY 10005</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Glass Form */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
              
              <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-8 shadow-xl shadow-slate-900/5">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Message Sent Successfully!</h3>
                    <p className="text-xs text-slate-600 font-medium">Our support desk will respond to <strong className="font-mono text-indigo-600">{formData.email}</strong> within 2 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Subject</label>
                      <input
                        type="text"
                        required
                        placeholder="Deposit Inquiry"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Message</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Describe your inquiry..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="minimal-btn-primary w-full py-3.5 px-4 text-xs font-extrabold flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/15 cursor-pointer"
                    >
                      <span>Send Support Ticket</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
