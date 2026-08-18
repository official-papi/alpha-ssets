"use client";

import { Star } from "lucide-react";

const REVIEWS = [
  { name: "David K. Sterling",  role: "Private Equity Trader",  rating: 5, quote: "HYIP MAX provides consistent automated yield credits without delay. The platform stability and double-entry transaction ledgers offer complete peace of mind." },
  { name: "Sarah L. Jenkins",   role: "Crypto Investor",        rating: 5, quote: "The 3-tier affiliate program and automated payout edge engine make this script unmatched. I've received instant withdrawals directly to my USDT wallet." },
  { name: "Viktor Petrov",      role: "Portfolio Manager",      rating: 5, quote: "Exceptional platform performance. Transparent package return cycles and real-time interest compounding calculators make capital allocation seamless." },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Testimonials</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">What Our Investors Say</h2>
          <p className="text-slate-500 text-sm mt-3">Feedback from active platform members and capital managers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, idx) => (
            <div key={idx} className="minimal-card p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed italic mb-6">&ldquo;{review.quote}&rdquo;</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  {review.name.split(" ")[0][0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{review.name}</h4>
                  <p className="text-[11px] text-slate-400">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
