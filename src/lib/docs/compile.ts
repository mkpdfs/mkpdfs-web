import { evaluate } from '@mdx-js/mdx'
import type { MDXContent } from 'mdx/types'
import * as runtime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import { visit } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'

export type Heading = { id: string; text: string; depth: 2 | 3 }

// rehype plugin: collect h2/h3 (after rehype-slug has set ids) into `sink`.
const collectHeadings = (sink: Heading[]) => () => (tree: any) => {
  visit(tree, 'element', (node: any) => {
    if (node.tagName === 'h2' || node.tagName === 'h3') {
      const id = node.properties?.id
      if (id) sink.push({ id, text: toString(node), depth: node.tagName === 'h2' ? 2 : 3 })
    }
  })
}

export async function compileDoc(body: string): Promise<{ Content: MDXContent; headings: Heading[] }> {
  const headings: Heading[] = []
  const { default: Content } = await evaluate(body, {
    ...runtime,
    baseUrl: import.meta.url,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      collectHeadings(headings),
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      [rehypePrettyCode, { theme: 'github-dark', keepBackground: false }],
    ],
  })
  return { Content, headings }
}
