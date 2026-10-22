import { Prompt } from '../components/ui'

// Placeholder until there are posts; articles live in `writing` in data.ts.
export default function Blog() {
  return (
    <div className="pt-10 sm:pt-14">
      <Prompt cmd="ls" arg="-lt blog/" />
      <h1 className="text-[28px] font-bold text-fg">blog</h1>
      <div className="mt-8 rounded-[4px] border border-dashed border-line-strong px-5 py-10 text-center text-[13px] text-muted">
        <div>
          <span className="text-faint">total 0</span>
        </div>
        <div className="mt-2">nothing here yet. posts are on the way.</div>
      </div>
    </div>
  )
}
