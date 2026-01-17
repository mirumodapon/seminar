interface I_Info {
  title?: string
  name?: string
  description?: string
  image?: string
  url?: string
  siteName?: string
  type?: string
  content?: string
  ogTitle?: string
  ogImage?: string
  ogDescription?: string
  ogUrl?: string
  ogType?: string
  ogSiteName?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
}

export function generateMeta(info: I_Info) {
  return [
    { title: info.title || info.name },
    { name: 'description', content: info.description || info.content },
    { property: 'og:title', content: info.ogTitle || info.title || info.name },
    { property: 'og:image', content: info.ogImage || info.twitterImage || info.image },
    { property: 'og:description', content: info.ogDescription || info.description || info.content },
    { property: 'og:url', content: info.ogUrl || info.url },
    { property: 'og:type', content: info.ogType || info.type || 'website' },
    { property: 'og:site_name', content: info.ogSiteName || info.siteName || info.name || info.title },
    { name: 'twitter:title', content: info.twitterTitle || info.title || info.name },
    { name: 'twitter:description', content: info.twitterDescription || info.description || info.content },
    { name: 'twitter:image', content: info.twitterImage || info.ogImage || info.image },
    { name: 'twitter:card', content: 'summary_large_image' },
  ].filter(({ content, title }) => content || title)
}
