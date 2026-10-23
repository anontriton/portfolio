import { Link } from 'react-router-dom'
import { formatDate, posts } from '../blog'
import { Prompt, Tag, accentFor } from '../components/ui'

// Lists the Markdown posts in src/posts/ (see src/blog.ts), newest first.
export default function Blog() {
  return (
    <div className="pt-10 sm:pt-14">
      <Prompt cmd="ls" arg="-lt blog/" />
      <h1 className="text-[28px] font-bold text-fg">blog</h1>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-[4px] border border-dashed border-line-strong bg-surface px-5 py-10 text-center text-[13px] text-muted">
          <div>
            <span className="text-faint">total 0</span>
          </div>
          <div className="mt-2">nothing here yet. posts are on the way.</div>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                viewTransition
                to={`/blog/${p.slug}`}
                className="group block rounded-[4px] border border-line bg-surface p-5 transition-colors hover:border-line-strong"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 text-[12px] text-muted">
                  <span>{formatDate(p.date)}</span>
                  <span className="text-faint">·</span>
                  <span>{p.readTime}</span>
                  {p.draft && <span className="text-orange">draft</span>}
                </div>
                <h2 className="mt-1.5 text-[16px] text-fg group-hover:text-blue">{p.title}</h2>
                {p.summary && <p className="mt-2 text-[13px] leading-relaxed text-fg-dim">{p.summary}</p>}
                {p.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t, i) => (
                      <Tag key={t} color={accentFor(i)}>
                        {t}
                      </Tag>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
