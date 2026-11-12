"use client";

import { Star } from "lucide-react";
import Image from "next/image";

const REVIEWS = [
  {
    name: "David K. Sterling",
    role: "Private Equity Trader",
    rating: 5,
    quote: "Alpha Assets provides consistent automated yield payouts without delay. The platform stability and double-entry transaction ledgers offer complete peace of mind.",
    avatar: "/images/avatars/david.jpg",
    tag: "Verified Investor",
  },
  {
    name: "Sarah L. Jenkins",
    role: "Crypto Wealth Manager",
    rating: 5,
    quote: "The 3-tier affiliate program and automated AI crash protection make this platform unmatched. I've received instant withdrawals directly to my wallet.",
    avatar: "/images/avatars/sarah.jpg",
    tag: "Vault Owner",
  },
  {
    name: "Viktor Petrov",
    role: "Institutional Allocator",
    rating: 5,
    quote: "Exceptional platform performance. Transparent package return cycles and real-time compounding calculators make capital allocation seamless.",
    avatar: "/images/avatars/viktor.jpg",
    tag: "Executive Tier",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 border-t border-[#e4e7dc] bg-[#fafaf5] text-[#20281f]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#20281f] mb-3">
            <span className="text-[#86a951] text-sm">✳</span>
            <span>Verified Investor Feedback</span>
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#20281f] leading-[1.06]">
            Trusted by traders, institutions, and everyday investors.
          </h2>
          <p className="text-base sm:text-lg text-[#60695b] mt-4 leading-relaxed font-normal">
            Direct feedback from active platform members and global institutional wealth managers.
          </p>
        </div>

        {/* 3 Stelsuite Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map((review, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#dde2d1] rounded-[14px] p-7 flex flex-col justify-between shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-[#60695b] bg-[#f4f7ec] px-2.5 py-0.5 rounded-full border border-[#dfe6d2]">
                    {review.tag}
                  </span>
                </div>

                <p className="text-sm text-[#20281f] leading-relaxed mb-6 font-normal">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#e4e7dc] flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#dde2d1] shrink-0 bg-[#e3f2c9]">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#20281f]">
                    {review.name}
                  </h4>
                  <p className="text-[11px] text-[#60695b] font-medium">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
