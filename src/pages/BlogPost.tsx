import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatDate, posts } from '../blog'
import DitherBanner, { seedFrom } from '../components/DitherBanner'
import { Prompt, Tag, accentFor } from '../components/ui'
import NotFound from './NotFound'

export default function BlogPost() {
  const { slug } = useParams()
  const post = posts.find((p) => p.slug === slug)

  useEffect(() => {
    if (!post) return
    const previous = document.title
    document.title = `${post.title} — Iverson Lai`
    return () => {
      document.title = previous
    }
  }, [post])

  if (!post) return <NotFound />

  return (
    <article className="pt-10 sm:pt-14">
      <Link viewTransition to="/blog" className="text-[12.5px] text-muted hover:text-blue">
        ← cd ..
      </Link>
      <div className="mt-6">
        <DitherBanner seed={seedFrom(post.slug)}>
          <Prompt cmd="cat" arg={`blog/${post.slug}.md`} />
          <h1 className="text-[28px] font-bold leading-tight text-fg sm:text-[34px]">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 text-[12.5px] text-muted">
            <span>{formatDate(post.date)}</span>
            <span className="text-faint">·</span>
            <span>{post.readTime}</span>
            {post.draft && <span className="text-orange">draft — only visible in dev</span>}
          </div>
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((t, i) => (
                <Tag key={t} color={accentFor(i)}>
                  {t}
                </Tag>
              ))}
            </div>
          )}
        </DitherBanner>
      </div>

      <div className="post mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />

      <div className="mt-16 border-t border-line pt-6">
        <Link viewTransition to="/blog" className="text-[13px] text-muted hover:text-blue">
          ← all posts
        </Link>
      </div>
    </article>
  )
}
