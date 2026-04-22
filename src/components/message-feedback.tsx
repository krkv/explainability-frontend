'use client'

import { useState } from 'react'
import classNames from 'classnames'
import { getLangfuseClient, isLangfuseFeedbackEnabled } from '@/lib/langfuse'
import styles from '@/styles/chat.module.css'

interface MessageFeedbackProps {
    traceId: string
}

type FeedbackValue = 0 | 1 | null
type SaveState = 'idle' | 'error'

const THUMBS_SCORE_NAME = 'user-thumbs'
const COMMENT_SCORE_NAME = 'user-feedback-comment'
const COMMENT_LIMIT = 500

function createScoreId(traceId: string, scoreName: string) {
    return `${traceId}:${scoreName}`
}

function ThumbsUpIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles['feedback-icon']}>
            <path
                d="M9 11V21M9 11L12.8 4.7C13.2 4 14 3.7 14.7 4C15.5 4.3 15.9 5.1 15.7 5.9L14.8 10H19.1C20.5 10 21.5 11.3 21.2 12.6L20.1 18.6C19.9 19.8 18.8 20.7 17.6 20.7H11.8C10.6 20.7 9.5 20.2 8.8 19.4L7.5 18V11.8L8.5 10.8C8.8 10.5 8.9 10.3 9 11ZM3 11H7.5V21H3.8C3.4 21 3 20.6 3 20.2V11.8C3 11.4 3.4 11 3.8 11H3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function ThumbsDownIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles['feedback-icon']}>
            <path
                d="M9 13V3M9 13L12.8 19.3C13.2 20 14 20.3 14.7 20C15.5 19.7 15.9 18.9 15.7 18.1L14.8 14H19.1C20.5 14 21.5 12.7 21.2 11.4L20.1 5.4C19.9 4.2 18.8 3.3 17.6 3.3H11.8C10.6 3.3 9.5 3.8 8.8 4.6L7.5 6V12.2L8.5 13.2C8.8 13.5 8.9 13.7 9 13ZM3 13H7.5V3H3.8C3.4 3 3 3.4 3 3.8V12.2C3 12.6 3.4 13 3.8 13H3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function CommentIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles['feedback-icon']}>
            <path
                d="M7 18.5H5.5C4.7 18.5 4 17.8 4 17V6.5C4 5.7 4.7 5 5.5 5H18.5C19.3 5 20 5.7 20 6.5V17C20 17.8 19.3 18.5 18.5 18.5H10.5L7 21V18.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default function MessageFeedback({ traceId }: MessageFeedbackProps) {
    const [selectedValue, setSelectedValue] = useState<FeedbackValue>(null)
    const [comment, setComment] = useState('')
    const [showCommentInput, setShowCommentInput] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [saveState, setSaveState] = useState<SaveState>('idle')

    if (!isLangfuseFeedbackEnabled()) {
        return null
    }

    async function submitFeedback(nextValue: FeedbackValue, nextComment: string) {
        const langfuse = getLangfuseClient()
        const trimmedComment = nextComment.trim()

        if (!langfuse || (nextValue === null && trimmedComment.length === 0)) {
            return
        }

        setIsSubmitting(true)
        setSaveState('idle')

        try {
            const submissions: Promise<unknown>[] = []

            if (nextValue !== null) {
                submissions.push(
                    Promise.resolve(
                        langfuse.score({
                            id: createScoreId(traceId, THUMBS_SCORE_NAME),
                            traceId,
                            name: THUMBS_SCORE_NAME,
                            value: nextValue,
                            dataType: 'BOOLEAN',
                        })
                    )
                )
            }

            if (trimmedComment.length > 0) {
                const commentPayload = {
                    id: createScoreId(traceId, COMMENT_SCORE_NAME),
                    traceId,
                    name: COMMENT_SCORE_NAME,
                    value: trimmedComment,
                    dataType: 'TEXT',
                }

                submissions.push(
                    Promise.resolve(
                        // Langfuse docs support TEXT scores, but the current browser SDK typings
                        // still only enumerate NUMERIC/CATEGORICAL/BOOLEAN.
                        // @ts-expect-error TEXT scores are accepted by the API but missing from the current SDK types.
                        langfuse.score(commentPayload)
                    )
                )
            }

            await Promise.all(submissions)
            setSelectedValue(nextValue)
            setComment(trimmedComment)
        } catch (error) {
            console.error(error)
            setSaveState('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleThumbClick(nextValue: 0 | 1) {
        void submitFeedback(nextValue, comment)
    }

    function handleCommentSave() {
        setShowCommentInput(false)
        void submitFeedback(selectedValue, comment)
    }

    function handleCommentChange(value: string) {
        setComment(value.slice(0, COMMENT_LIMIT))
        setSaveState('idle')
    }

    return (
        <div className={styles['message-feedback']}>
            <div className={styles['message-feedback-actions']}>
                <button
                    type="button"
                    className={classNames(
                        styles['feedback-button'],
                        selectedValue === 1 ? styles['feedback-button-selected'] : null,
                    )}
                    onClick={() => handleThumbClick(1)}
                    disabled={isSubmitting}
                    aria-label="Mark response as helpful"
                    title="Helpful"
                >
                    <ThumbsUpIcon />
                </button>
                <button
                    type="button"
                    className={classNames(
                        styles['feedback-button'],
                        selectedValue === 0 ? styles['feedback-button-selected'] : null,
                    )}
                    onClick={() => handleThumbClick(0)}
                    disabled={isSubmitting}
                    aria-label="Mark response as not helpful"
                    title="Not helpful"
                >
                    <ThumbsDownIcon />
                </button>
                <button
                    type="button"
                    className={classNames(
                        styles['feedback-button'],
                        showCommentInput || comment.trim().length > 0 ? styles['feedback-button-selected'] : null,
                    )}
                    onClick={() => setShowCommentInput((previousValue) => !previousValue)}
                    disabled={isSubmitting}
                    aria-label={showCommentInput ? 'Hide feedback comment input' : 'Add a feedback comment'}
                    title={showCommentInput ? 'Hide comment' : 'Add comment'}
                >
                    <CommentIcon />
                </button>
            </div>
            {showCommentInput ? (
                <div className={styles['message-feedback-comment-box']}>
                    <textarea
                        className={styles['message-feedback-textarea']}
                        rows={3}
                        placeholder="Tell us what worked or what was missing."
                        value={comment}
                        onChange={(event) => handleCommentChange(event.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className={styles['message-feedback-footer']}>
                        <span className={styles['message-feedback-count']}>
                            {comment.length}/{COMMENT_LIMIT}
                        </span>
                        <button
                            type="button"
                            className={styles['feedback-save-button']}
                            onClick={handleCommentSave}
                            disabled={isSubmitting || (selectedValue === null && comment.trim().length === 0)}
                        >
                            Send
                        </button>
                    </div>
                </div>
            ) : null}
            {saveState === 'error' ? (
                <p className={classNames(styles['message-feedback-status'], styles['message-feedback-error'])}>
                    Feedback could not be saved right now.
                </p>
            ) : null}
        </div>
    )
}
