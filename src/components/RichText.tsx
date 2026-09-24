// Renders confirmed review text (publicSummary / documentationContent) as
// paragraphs, with support for fenced code blocks (```like this```) so that
// once real code examples are authored during the review, they display with
// code-block styling. This component never generates content; it only
// formats whatever text has already been written into the review.
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/```/)
  return (
    <>
      {blocks.map((block, index) => {
        const isCode = index % 2 === 1
        if (isCode) {
          const firstLineBreak = block.indexOf('\n')
          const code = firstLineBreak === -1 ? block : block.slice(firstLineBreak + 1)
          return (
            <pre className="doc-code" key={index}>
              <code>{code.trim()}</code>
            </pre>
          )
        }
        return block
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((paragraph, paragraphIndex) => <p key={`${index}-${paragraphIndex}`}>{paragraph}</p>)
      })}
    </>
  )
}
