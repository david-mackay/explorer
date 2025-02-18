import { JupiterSwapForm } from '@/components/transactions/jupiter-swap-form'
import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'

export const metadata: Metadata = {
  title: 'Token Swap | Fast & Efficient Trading',
  description:
    'Swap tokens instantly with the best rates using Jupiter aggregator. Access deep liquidity, minimal slippage, and lightning-fast transactions on Solana.',
  openGraph: {
    title: 'Token Swap | Fast & Efficient Trading',
    description:
      'Swap tokens instantly with the best rates using Jupiter aggregator. Access deep liquidity, minimal slippage, and lightning-fast transactions on Solana.',
    type: 'website',
    images: [
      {
        url: '/og-swap.png',
        width: 1200,
        height: 630,
        alt: 'Token Swap Interface',
      },
    ],
    siteName: 'Explorer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Token Swap | Fast & Efficient Trading',
    description:
      'Swap tokens instantly with the best rates using Jupiter aggregator. Access deep liquidity, minimal slippage, and lightning-fast transactions on Solana.',
    images: ['/og-swap.png'],
  },
}

export default function SwapPage() {
  const t = useTranslations()
  return (
    <div className="px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('trade.swap_tokens')}</h1>
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-green-500/20">
          <JupiterSwapForm hideWhenGlobalSearch />
        </div>
      </div>
    </div>
  )
}
