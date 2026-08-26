import React, { useState } from 'react';
import {
  X,
  Check,
  Zap,
  Sparkles,
  Shield,
  CreditCard,
  Flame,
  Radio
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline-strong)] p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--ink-3)] hover:text-[var(--ink)] transition p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)]"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--advisor)_12%,transparent)] border border-[color-mix(in_srgb,var(--advisor)_35%,transparent)] text-xs font-mono text-[var(--advisor)] uppercase tracking-wider font-semibold">
            <Sparkles size={13} />
            <span>Altor Membership &amp; Tiers</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight">
            Elevate Your Cognitive Velocity
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-2)]">
            Enjoy full access to all 5 AI faculty on our generous free tier, or unlock cloud synchronization, voice sparring, and hosted reasoning models.
          </p>

          {/* Billing Switcher */}
          <div className="pt-2 flex justify-center">
            <div className="segmented">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={billingCycle === 'monthly' ? 'active' : ''}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={billingCycle === 'annual' ? 'active' : ''}
              >
                Annual <span className="text-[10px] text-[var(--tutor)] ml-1 font-mono">SAVE 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* 1. Free Scholar */}
          <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono uppercase text-[var(--ink-3)] tracking-wider font-semibold">Free Scholar</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-3xl font-display font-bold text-[var(--ink)]">$0</span>
                  <span className="text-xs text-[var(--ink-3)]">/ forever</span>
                </div>
                <p className="text-xs text-[var(--ink-2)] mt-1 font-sans">
                  The complete autodidactic learning suite. Master any subject with zero paywalls.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-[var(--ink)] border-t border-[var(--hairline)] pt-4 font-sans">
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                  <span>All 5 AI Faculty Unlocked</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                  <span>2 Active Concurrent Journeys</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                  <span>Curriculum &amp; Sandeep Swadia Cut List</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                  <span>Socratic Dialogue &amp; Feynman Studio</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--tutor)] flex-shrink-0 mt-0.5" />
                  <span>BYO Gemini API Key / Demo Mode</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-[var(--surface-3)] hover:border-[var(--hairline-strong)] border border-[var(--hairline)] text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] transition"
            >
              Current Plan (Active)
            </button>
          </div>

          {/* 2. Pro Autodidact */}
          <div className="relative rounded-xl bg-gradient-to-b from-[var(--surface-3)] to-[var(--surface-2)] border-2 border-[var(--advisor)] p-6 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[var(--advisor)] text-[#04050a] text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
              Recommended
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono uppercase text-[var(--advisor)] tracking-wider font-semibold">Pro Autodidact</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-3xl font-display font-bold text-[var(--ink)]">
                    {billingCycle === 'annual' ? '$12' : '$15'}
                  </span>
                  <span className="text-xs text-[var(--ink-3)]">/ mo</span>
                </div>
                <p className="text-xs text-[var(--ink-2)] mt-1 font-sans">
                  Unlimited velocity with cloud sync, voice sparring, and hosted reasoning models.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-[var(--ink)] border-t border-[var(--hairline)] pt-4 font-sans">
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--advisor)] flex-shrink-0 mt-0.5" />
                  <span><strong>Unlimited Active Journeys</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--advisor)] flex-shrink-0 mt-0.5" />
                  <span>Encrypted Cloud Vault Backup</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--advisor)] flex-shrink-0 mt-0.5" />
                  <span>Audio Voice Socratic Drills</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--advisor)] flex-shrink-0 mt-0.5" />
                  <span>Claude 3.5 &amp; DeepSeek R1 Hosted AI</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--advisor)] flex-shrink-0 mt-0.5" />
                  <span>Obsidian &amp; Notion Graph Export</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-[var(--advisor)] hover:brightness-110 text-[#04050a] font-bold text-xs shadow-md transition"
            >
              Start 14-Day Pro Trial
            </button>
          </div>

          {/* 3. Fellow Quad */}
          <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono uppercase text-[var(--roommate)] tracking-wider font-semibold">Fellow Quad</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-3xl font-display font-bold text-[var(--ink)]">
                    {billingCycle === 'annual' ? '$24' : '$29'}
                  </span>
                  <span className="text-xs text-[var(--ink-3)]">/ mo</span>
                </div>
                <p className="text-xs text-[var(--ink-2)] mt-1 font-sans">
                  For study groups, research labs, team upskilling, and elite polymaths.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-[var(--ink)] border-t border-[var(--hairline)] pt-4 font-sans">
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--roommate)] flex-shrink-0 mt-0.5" />
                  <span>Collaborative Quad Study Rooms</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--roommate)] flex-shrink-0 mt-0.5" />
                  <span>Cryptographic Proof Credentials</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--roommate)] flex-shrink-0 mt-0.5" />
                  <span>Feynman / von Neumann Calibration</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--roommate)] flex-shrink-0 mt-0.5" />
                  <span>Priority GPU High-Throughput Inference</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-[var(--surface-3)] hover:border-[var(--hairline-strong)] border border-[var(--hairline)] text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] transition"
            >
              Explore Fellow Quad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
