import { Link } from '@/i18n/routing'
import { CodeBlock } from './CodeBlock'

export const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} />,
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string; children?: React.ReactNode }) =>
    href?.startsWith('/') ? (
      <Link href={href as Parameters<typeof Link>[0]['href']} {...props}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
    ),
  pre: ({ children, className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <CodeBlock className={className} {...props}>{children}</CodeBlock>
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
}
