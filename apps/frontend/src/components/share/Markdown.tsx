import type { ComponentProps } from 'react'
import type { MarkdownOptions } from '~/utils/markdown'
import { Activity, memo, useMemo } from 'react'
import { Markdown } from '~/utils/markdown'

interface Props extends ComponentProps<'div'> {
  options?: MarkdownOptions
  content?: string
}

const NpMarkdown = memo(({ options, content, className, ...props }: Props) => {
  const md = useMemo(() => new Markdown(options), [options])
  const html = useMemo(() => md.render(content ?? ''), [md, content])

  return (
    <Activity mode={html ? 'visible' : 'hidden'}>
      <div
        // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
        dangerouslySetInnerHTML={{ __html: html! }}
        {...props}
      />
    </Activity>
  )
})

export default NpMarkdown
