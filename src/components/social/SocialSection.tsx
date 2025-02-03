'use client'

import { useRouter } from 'next/navigation'
import { memo } from 'react'
import { TokenAddress } from '../tokens/TokenAddress'
import { FollowButton } from '../profile/follow-button'
import { Avatar } from '../common/Avatar'

interface SocialUser {
  id: string
  created_at: number
  namespace: string
  username: string
  bio: string | null
  wallet?: {
    id: string
    blockchain: string
  }
}

interface SocialSectionProps {
  users?: SocialUser[]
  isLoading?: boolean
  error?: string | null
  type: 'followers' | 'following'
}

const SocialCard = memo(
  ({ user, type }: { user: SocialUser; type: string }) => {
    const router = useRouter()

    return (
      <div className="p-3 hover:bg-green-900/10">
        <div className="flex items-center gap-3">
          <Avatar
            username={user.username}
            size={40}
            className="flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => router.push(`/${user.username}`)}
                className="text-green-400 font-mono text-sm bg-green-900/20 px-2 py-1 rounded-lg hover:bg-green-900/40 transition-colors"
              >
                @{user.username}
              </button>
              <div className="flex-shrink-0">
                <FollowButton username={user.username} size="sm" />
              </div>
            </div>

            {user.wallet?.id && (
              <div className="flex items-center text-xs">
                <TokenAddress address={user.wallet.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)

SocialCard.displayName = 'SocialCard'

export function SocialSection({
  users = [],
  isLoading,
  error,
  type,
}: SocialSectionProps) {
  if (!users.length && !isLoading) return null

  return (
    <div className="border border-green-800 bg-black/50 rounded-lg overflow-hidden">
      <div className="border-b border-green-800 p-3 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="text-green-500 text-sm font-mono flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {'>'} {type}
          </div>
          <div className="text-xs text-green-600 font-mono bg-green-900/20 px-2 py-1 rounded-full">
            COUNT: {users.length}
          </div>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto divide-y divide-green-800/30">
        {isLoading ? (
          <div className="p-4 text-center text-green-600 font-mono animate-pulse">
            Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            No {type} found
          </div>
        ) : (
          users.map((user) => (
            <SocialCard key={user.id} user={user} type={type} />
          ))
        )}
      </div>
    </div>
  )
}
