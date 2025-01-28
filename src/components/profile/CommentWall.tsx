import { useState } from 'react'
import { Card } from '../common/card'
import { usePostComment } from '@/hooks/use-post-comment'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { Alert } from '../common/alert'
import { LoadCircle } from '../common/load-circle'
import Link from 'next/link'
import { Avatar } from '../common/Avatar'
import { CommentItem } from '@/hooks/use-profile-comments'
import { useCommentLikes } from '@/hooks/use-comment-likes'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { useProfileComments } from '@/hooks/use-profile-comments'

interface Props {
  username: string
  comments?: CommentItem[]
  isLoading?: boolean
}

export function CommentWall({
  username,
  comments = [],
  isLoading = false,
}: Props) {
  const [commentText, setCommentText] = useState('')
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null)
  const { postComment, isLoading: postCommentLoading, error } = usePostComment()
  const { mainUsername } = useCurrentWallet()
  const {
    likeComment,
    unlikeComment,
    isLoading: likeLoading,
  } = useCommentLikes()

  // Add the useProfileComments hook to get access to mutate
  const { mutate: refreshComments } = useProfileComments(
    username,
    mainUsername || undefined,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !mainUsername) return

    console.log('replyToCommentId', replyToCommentId)
    console.log('commentText', commentText)
    console.log('mainUsername', mainUsername)
    console.log('username', username)

    try {
      await postComment({
        profileId: mainUsername,
        targetProfileId: username,
        text: commentText.trim(),
        ...(replyToCommentId && { commentId: replyToCommentId }),
      })
      setCommentText('') // Clear the input on success
      setReplyToCommentId(null) // Clear reply state
    } catch (err) {
      console.error('Failed to post comment:', err)
    } finally {
      // Always refresh comments, even if there was an error
      await refreshComments()
    }
  }

  const handleLike = async (commentId: string, isLiked: boolean) => {
    if (!mainUsername || likeLoading) return

    // Optimistically update the UI
    await refreshComments()

    try {
      if (isLiked) {
        await unlikeComment(commentId, mainUsername)
      } else {
        await likeComment(commentId, mainUsername)
      }
      // Refresh to get the actual server state
      await refreshComments()
    } catch (err) {
      console.error('Failed to handle like:', err)
      // Refresh again in case of error to ensure UI is in sync
      await refreshComments()
    }
  }

  const handleReply = (commentId: string) => {
    if (!mainUsername) return
    setReplyToCommentId(replyToCommentId === commentId ? null : commentId)
    setCommentText('') // Clear any existing comment text
  }

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">Comment Wall</h3>
        <div className="space-y-4">
          {/* Comments List */}
          <div className="space-y-3 mb-4">
            {isLoading ? (
              <div className="text-center text-green-600 font-mono py-4">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-green-600 font-mono py-4">
                be the first to comment on this profile
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.comment.id}>
                  <div className="border border-green-800/30 rounded-lg p-3">
                    {comment.author && (
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          href={`/${comment.author.username}`}
                          className="flex items-center gap-2 hover:opacity-80"
                        >
                          <Avatar
                            username={comment.author.username}
                            size={24}
                          />
                          <span className="text-green-400 font-mono text-sm">
                            @{comment.author.username}
                          </span>
                        </Link>
                      </div>
                    )}
                    <div className="text-green-300 font-mono">
                      {comment.comment.text}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-green-600 font-mono text-xs">
                        {new Date(
                          comment.comment.created_at,
                        ).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-3">
                        {mainUsername && (
                          <button
                            onClick={() => handleReply(comment.comment.id)}
                            className={`p-1 rounded-full hover:bg-green-900/20 transition-colors flex items-center gap-1 ${
                              !mainUsername
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            <ChatBubbleLeftIcon className="w-5 h-5 text-green-500" />
                            <span className="text-green-500 font-mono text-sm">
                              {comment.socialCounts?.replyCount || 0} Reply
                            </span>
                          </button>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleLike(
                                comment.comment.id,
                                comment.requestingProfileSocialInfo?.hasLiked ||
                                  false,
                              )
                            }
                            disabled={!mainUsername || likeLoading}
                            className={`p-1 rounded-full hover:bg-green-900/20 transition-colors ${
                              !mainUsername
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            {comment.requestingProfileSocialInfo?.hasLiked ? (
                              <HeartSolid className="w-5 h-5 text-green-500" />
                            ) : (
                              <HeartOutline className="w-5 h-5 text-green-500" />
                            )}
                          </button>
                          <span className="text-green-500 font-mono text-sm">
                            {comment.socialCounts?.likeCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display Threaded Replies */}
                  {comment.recentReplies &&
                    comment.recentReplies.length > 0 && (
                      <div className="mt-2 ml-8 space-y-2">
                        {comment.recentReplies.map((reply) => (
                          <div
                            key={reply.comment.id}
                            className="border-l-2 border-green-800/30 pl-4"
                          >
                            <div className="border border-green-800/30 rounded-lg p-3">
                              {reply.author && (
                                <div className="flex items-center gap-2 mb-2">
                                  <Link
                                    href={`/${reply.author.username}`}
                                    className="flex items-center gap-2 hover:opacity-80"
                                  >
                                    <Avatar
                                      username={reply.author.username}
                                      size={20}
                                    />
                                    <span className="text-green-400 font-mono text-sm">
                                      @{reply.author.username}
                                    </span>
                                  </Link>
                                </div>
                              )}
                              <div className="text-green-300 font-mono text-sm">
                                {reply.comment.text}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="text-green-600 font-mono text-xs">
                                  {new Date(
                                    reply.comment.created_at,
                                  ).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      handleLike(
                                        reply.comment.id,
                                        reply.requestingProfileSocialInfo
                                          ?.hasLiked || false,
                                      )
                                    }
                                    disabled={!mainUsername || likeLoading}
                                    className={`p-1 rounded-full hover:bg-green-900/20 transition-colors ${
                                      !mainUsername
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                    }`}
                                  >
                                    {reply.requestingProfileSocialInfo
                                      ?.hasLiked ? (
                                      <HeartSolid className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <HeartOutline className="w-4 h-4 text-green-500" />
                                    )}
                                  </button>
                                  <span className="text-green-500 font-mono text-sm">
                                    {reply.socialCounts?.likeCount || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Reply Form */}
                  {replyToCommentId === comment.comment.id && mainUsername && (
                    <div className="mt-2 ml-6 border-l-2 border-green-800/30 pl-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full h-24 bg-black/20 border border-green-800/50 rounded-lg p-3 text-green-400 font-mono placeholder-green-700 focus:outline-none focus:border-green-600 hover:border-green-700 cursor-text transition-colors resize-none ring-1 ring-green-900/30 hover:ring-green-800/50 focus:ring-green-600"
                            disabled={postCommentLoading}
                          />
                          {postCommentLoading && (
                            <div className="absolute right-3 top-3">
                              <LoadCircle />
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={postCommentLoading || !commentText.trim()}
                            className="px-4 py-2 bg-green-900/30 text-green-400 font-mono rounded hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {postCommentLoading ? 'Posting...' : 'Post Reply'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Main Comment Form - Only show when mainUsername exists */}
          {mainUsername && !replyToCommentId && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full h-24 bg-black/20 border border-green-800/50 rounded-lg p-3 text-green-400 font-mono placeholder-green-700 focus:outline-none focus:border-green-600 hover:border-green-700 cursor-text transition-colors resize-none ring-1 ring-green-900/30 hover:ring-green-800/50 focus:ring-green-600"
                  disabled={postCommentLoading}
                />
                {postCommentLoading && (
                  <div className="absolute right-3 top-3">
                    <LoadCircle />
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={postCommentLoading || !commentText.trim()}
                  className="px-4 py-2 bg-green-900/30 text-green-400 font-mono rounded hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {postCommentLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}
          {error && <Alert type="error" message={error} />}
        </div>
      </div>
    </Card>
  )
}
