import type { Options, PluginSimple } from 'markdown-it'
import { attrs } from '@mdit/plugin-attrs'
import { container } from '@mdit/plugin-container'
import { imgSize, obsidianImgSize } from '@mdit/plugin-img-size'
import { ins } from '@mdit/plugin-ins'
import { mark } from '@mdit/plugin-mark'
import { sub } from '@mdit/plugin-sub'
import { sup } from '@mdit/plugin-sup'
import { tasklist } from '@mdit/plugin-tasklist'
import MarkdownIt from 'markdown-it'

export interface MarkdownOptions extends Options {
  plugins: PluginSimple[]
}

export class Markdown extends MarkdownIt {
  constructor(options?: MarkdownOptions) {
    super(options ?? {
      html: true,
      linkify: true,
      typographer: true,
    })

    options?.plugins.forEach((plugin) => {
      this.use(plugin)
    })

    this.use(
      container,
      {
        name: 'container',
        validate: (params: string) => ['error', 'info', 'success', 'warning']
          .includes(params.trim()),
        openRender: (tokens, index) => `<div class="container container-${tokens[index].info}">`,
      },
    )

    this.use(attrs)
    this.use(imgSize)
    this.use(obsidianImgSize)
    this.use(ins)
    this.use(mark)
    this.use(sub)
    this.use(sup)
    this.use(tasklist)
  }
}
