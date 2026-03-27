'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { paymentService } from '@/services';

export const TokenBadge: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const response = await paymentService.getTokenBalance();
        setBalance(response.data?.tokenBalance ?? 0);
      } catch {
        setBalance(null);
      }
    };
    loadBalance();
  }, []);

  if (balance === null) return null;

  return (
    <Link
      href="/tokens"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-800 transition-colors"
      title="Token balance"
    >
      <svg
        className="w-4 h-4 text-primary-600 dark:text-primary-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.389 5.389 0 01-.421-.821H10a1 1 0 100-2H8.014a7.36 7.36 0 010-1H10a1 1 0 100-2H8.315c.128-.29.27-.564.421-.821z" />
      </svg>
      <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
        {balance}
      </span>
    </Link>
  );
};

export default TokenBadge;
