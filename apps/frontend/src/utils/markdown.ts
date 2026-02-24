import type { Options, PluginSimple } from 'markdown-it'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import MarkdownIt from 'markdown-it'

export interface MarkdownOptions extends Options {
  plugins: PluginSimple[]
}

export class Markdown extends MarkdownIt {
  window: any
  domPurify: any

  constructor(options?: MarkdownOptions) {
    super(options ?? {
      html: true,
      linkify: true,
      typographer: true,
    })

    options?.plugins.forEach((plugin) => {
      this.use(plugin)
    })

    this.window = new JSDOM('').window
    this.domPurify = createDOMPurify(this.window)
  }

  safeRender(str: string) {
    return this.domPurify.sanitize(this.render(str))
  }
}
