'use client'

import TokenCard from '@/components/TokenCard'
import { Token } from '@/types/Token'
import { Transaction, getTransactionHistory } from '@/utils/helius'
import { useState } from 'react'
import TransactionList from './TransactionList'

interface PortfolioTabsProps {
  address: string
  fungibleTokens: Token[]
  nonfungibleTokens: Token[]
  initialTransactions: Transaction[]
}

export default function PortfolioTabs({
  address,
  fungibleTokens,
  nonfungibleTokens,
  initialTransactions,
}: PortfolioTabsProps) {
  const [activeTab, setActiveTab] = useState<
    'fungible' | 'nonfungible' | 'transactions'
  >('fungible')
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadMoreTransactions = async () => {
    if (transactions.length === 0) return

    setLoadingMore(true)
    try {
      const lastSignature = transactions[transactions.length - 1].signature
      const moreTxs = await getTransactionHistory(address, lastSignature)
      setTransactions([...transactions, ...moreTxs])
    } catch (error) {
      console.error('Error loading more transactions:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-8">
        <button
          onClick={() => setActiveTab('fungible')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'fungible'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Tokens ({fungibleTokens.length})
        </button>
        <button
          onClick={() => setActiveTab('nonfungible')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'nonfungible'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          NFTs ({nonfungibleTokens.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'transactions'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Transactions ({transactions.length})
        </button>
      </div>

      {activeTab !== 'transactions' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'fungible' ? fungibleTokens : nonfungibleTokens).map(
            (token) => (
              <TokenCard key={token.id} token={token} tokenType={activeTab} />
            ),
          )}
        </div>
      ) : (
        <TransactionList
          transactions={transactions}
          loadingMore={loadingMore}
          onLoadMore={loadMoreTransactions}
        />
      )}

      {((activeTab !== 'transactions' &&
        (activeTab === 'fungible' ? fungibleTokens : nonfungibleTokens)
          .length === 0) ||
        (activeTab === 'transactions' && transactions.length === 0)) && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No{' '}
            {activeTab === 'fungible'
              ? 'tokens'
              : activeTab === 'nonfungible'
                ? 'NFTs'
                : 'transactions'}{' '}
            found for this wallet
          </p>
        </div>
      )}
    </>
  )
}
