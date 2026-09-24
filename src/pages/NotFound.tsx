import { PageIntro, TextLink } from '../components/ui'

export function NotFound() {
  return <>
    <PageIntro eyebrow="404" title="This page is not part of the operation." text="The address may have changed. Return to the Harba home page, or explore one of the sections below." />
    <section className="section paper">
      <div className="container not-found-links">
        <TextLink to="/">Go to the homepage</TextLink>
        <TextLink to="/use-cases">Explore use cases</TextLink>
        <TextLink to="/how-we-work">See how we work</TextLink>
        <TextLink to="/governance">Read about governance</TextLink>
        <TextLink to="/book-a-working-session">Request a working session</TextLink>
      </div>
    </section>
  </>
}
