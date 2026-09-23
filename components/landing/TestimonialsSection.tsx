"use client";

import { Star, MessageSquare } from "lucide-react";
import Image from "next/image";

const REVIEWS = [
  {
    name: "David K. Sterling",
    role: "Private Equity Trader",
    rating: 5,
    quote: "Alpha Assets provides consistent automated yield credits without delay. The platform stability and double-entry transaction ledgers offer complete peace of mind.",
    avatar: "/images/avatars/david.jpg",
  },
  {
    name: "Sarah L. Jenkins",
    role: "Crypto Investor",
    rating: 5,
    quote: "The 3-tier affiliate program and automated payout edge engine make this platform unmatched. I've received instant withdrawals directly to my USDT wallet.",
    avatar: "/images/avatars/sarah.jpg",
  },
  {
    name: "Viktor Petrov",
    role: "Portfolio Manager",
    rating: 5,
    quote: "Exceptional platform performance. Transparent package return cycles and real-time interest compounding calculators make capital allocation seamless.",
    avatar: "/images/avatars/viktor.jpg",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#001011] border-b border-[#093A3E] relative overflow-hidden text-white">
      
      {/* Ambient background glow in Dark Teal */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#093A3E]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#3AAFB9]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex justify-center mb-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#3AAFB9]/40 bg-[#093A3E]/80 text-[#3AAFB9] shadow-2xs">
              <MessageSquare className="w-3.5 h-3.5 text-[#3AAFB9]" />
              <span>Verified Testimonials</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What Our Investors Say
          </h2>
          <p className="text-[#86cbd1] text-sm mt-3 font-normal max-w-xl mx-auto">
            Direct feedback from active platform members and global institutional wealth managers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review, idx) => (
            <div
              key={idx}
              className="bg-[#041819] border border-[#093A3E] hover:border-[#3AAFB9] rounded-2xl p-8 flex flex-col justify-between shadow-lg hover:shadow-xl hover:shadow-[#3AAFB9]/10 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center gap-1 text-[#3AAFB9] mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-[#d9eef0] leading-relaxed italic mb-6 font-normal">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#093A3E]/70 flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#3AAFB9]/40 flex-shrink-0 bg-[#093A3E]">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#3AAFB9] transition-colors">
                    {review.name}
                  </h4>
                  <p className="text-[11px] text-[#3AAFB9] font-medium">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
