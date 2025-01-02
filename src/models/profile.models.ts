import { BLOCKCHAIN, IPaginatedResponse } from '@/models/common.models'

export interface ISocialCounts {
  followers: number
  following: number
}

export interface IProfileResponse {
  walletAddress: string
  socialCounts: {
    followers: number
    following: number
  }
}

export interface IProfile {
  id: string
  created_at: number
  username: string
  bio: string | null
  image: string | null
  namespace: string
  blockchain: BLOCKCHAIN
  isWaitListed?: boolean
}

export interface IGetSocialResponse {
  profiles: IProfile[]
  page: number
  pageSize: number
}

export interface ISuggestedProfile {
  namespaces: {
    name: string
    readableName: string
    faviconURL: string
  }[]
  profile: {
    blockchain: string
    namespace: string
    id: string
    username: string
    image: string
  }
  wallet: { address: string }
}

export interface ISuggestedProfiles {
  id: string
  username: string
  walletAddress: string
  bio?: string
  avatar?: string
}
