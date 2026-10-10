'use client';

import { useRouter } from 'next/navigation';
import type { Plan } from '@/lib/plans-config';
import { useAuth } from '@/lib/auth-context';

/**
 * CTA dei piani tariffari.
 * - Free: link esterno come prima (Chrome Web Store).
 * - Pro/Team: se non hai fatto l'accesso vai al login e dopo torni a pagare
 *   (/auth?next=/account&plan=pro); se hai già fatto l'accesso vai al pagamento.
 */
export default function PricingCta({ plan }: { plan: Plan }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (plan.id === 'free') {
    return (
      <a
        href={plan.ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-bold text-zinc-300 transition-all hover:bg-white/10 hover:border-white/20"
      >
        {plan.ctaLabel}
      </a>
    );
  }

  const handleClick = () => {
    if (loading) return;
    if (user) {
      router.push(`/account?plan=${plan.id}`);
    } else {
      router.push(`/auth?next=/account&plan=${plan.id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all disabled:opacity-50 ${plan.highlighted
        ? 'bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white hover:opacity-90 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
        : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/20'
        }`}
    >
      {plan.ctaLabel}
    </button>
  );
}
