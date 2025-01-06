import { useEffect, useState } from 'react'
import { Transaction } from '@/utils/helius/types'
import { GetFollowingResponse } from '../types'
import { useHolderCheck } from '@/components/auth/hooks/use-holder-check'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'

// Helper to fetch transactions for a single wallet
async function fetchWalletTransactions(
  walletId: string,
): Promise<Transaction[]> {
  const url = new URL('/api/transactions', window.location.origin)
  url.searchParams.set('address', walletId)

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.log(`Failed to fetch transactions for ${walletId}`)
      return []
    }
    const data = await response.json()
    return data.map((tx: Transaction) => ({
      ...tx,
      sourceWallet: walletId, // Add source wallet for tracking
    }))
  } catch (error) {
    console.log(`Error fetching transactions for ${walletId}:`, error)
    return []
  }
}

export const useFollowingTransactions = (
  following: GetFollowingResponse | undefined,
) => {
  const [aggregatedTransactions, setAggregatedTransactions] = useState<
    Transaction[]
  >([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [loadedWallets, setLoadedWallets] = useState<Set<string>>(new Set())
  const [totalWallets, setTotalWallets] = useState<number>(0)
  const { isHolder, isCheckingHolder, startCheck } = useHolderCheck()
  const { walletAddress, isLoggedIn, sdkHasLoaded } = useCurrentWallet()

  // Trigger holder check if needed
  useEffect(() => {
    if (
      walletAddress &&
      isLoggedIn &&
      sdkHasLoaded &&
      isHolder === null &&
      !isCheckingHolder
    ) {
      console.log('useFollowingTransactions: Triggering holder check')
      startCheck()
    }
  }, [walletAddress, isLoggedIn, sdkHasLoaded, isHolder, isCheckingHolder])

  useEffect(() => {
    console.log('Transaction fetch conditions:', {
      hasFollowing: !!following?.profiles?.length,
      isHolder,
      isCheckingHolder,
      walletAddress,
    })

    // Reset states when dependencies change
    setLoadedWallets(new Set())
    setTotalWallets(following?.profiles?.length ?? 0)

    // Don't fetch if not ready
    if (!following?.profiles?.length || isCheckingHolder) {
      setAggregatedTransactions([])
      return
    }

    // Don't fetch if we know we're not a holder
    if (isHolder === false) {
      setAggregatedTransactions([])
      return
    }

    // Don't fetch if we don't know holder status yet
    if (isHolder === null) {
      setAggregatedTransactions([])
      return
    }

    const fetchAllTransactions = async () => {
      setIsLoadingTransactions(true)

      try {
        // Get wallet IDs, filtering out undefined/null values
        const walletIds = following.profiles
          .map((profile) => profile.wallet?.id)
          .filter((id): id is string => !!id)

        // Create a map to store transactions by wallet
        const transactionsByWallet: { [key: string]: Transaction[] } = {}

        // Fetch transactions for all wallets concurrently
        const fetchPromises = walletIds.map(async (walletId) => {
          try {
            const transactions = await fetchWalletTransactions(walletId)
            transactionsByWallet[walletId] = transactions
            setLoadedWallets((prev) => new Set([...Array.from(prev), walletId]))

            // Update aggregated transactions whenever we get new data
            const allCurrentTransactions = Object.values(transactionsByWallet)
              .flat()
              .sort((a, b) => {
                const timeA = new Date(a.timestamp).getTime()
                const timeB = new Date(b.timestamp).getTime()
                return timeB - timeA
              })
              .slice(0, 50)

            setAggregatedTransactions(allCurrentTransactions)
          } catch (error) {
            console.error(`Error fetching transactions for ${walletId}:`, error)
            setLoadedWallets((prev) => new Set([...Array.from(prev), walletId])) // Mark as loaded even on error
          }
        })

        await Promise.all(fetchPromises)
      } catch (error) {
        console.error('Error aggregating transactions:', error)
      } finally {
        setIsLoadingTransactions(false)
      }
    }

    fetchAllTransactions()
  }, [following, isHolder, isCheckingHolder, walletAddress])

  return {
    aggregatedTransactions,
    isLoadingTransactions,
    isCheckingHolder,
    isHolder,
    loadedWallets: loadedWallets.size,
    totalWallets,
  }
}
