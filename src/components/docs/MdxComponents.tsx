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
  Callout: ({
    children,
    type = 'info',
  }: {
    children: React.ReactNode
    type?: 'info' | 'warn' | 'danger'
  }) => {
    const styles: Record<string, string> = {
      info: 'border-brand/40 bg-brand/5 text-fg',
      warn: 'border-warn/40 bg-warn/5 text-fg',
      danger: 'border-danger/40 bg-danger/5 text-fg',
    }
    return (
      <div className={`my-4 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
        {children}
      </div>
    )
  },
}
