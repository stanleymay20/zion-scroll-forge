/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to ScrollUniversity — confirm your email to begin</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>SCROLLUNIVERSITY</Text>
          <Text style={tagline}>Where wisdom meets the scroll</Text>
        </Section>
        <Heading style={h1}>Welcome to {siteName}</Heading>
        <Text style={text}>
          You've taken the first step into a kingdom education. Confirm your
          email{' '}
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>{' '}
          to unlock your faculty enrollment, AI tutors, and the Scroll Library.
        </Text>
        <Section style={buttonWrap}>
          <Button style={button} href={confirmationUrl}>
            Confirm & Begin
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={verse}>
          “The fear of the Lord is the beginning of wisdom.” — Proverbs 9:10
        </Text>
        <Text style={footer}>
          Didn't create an account? You can safely ignore this message.
          <br />
          <Link href={siteUrl} style={footerLink}>{siteName}</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = {
  backgroundColor: 'hsl(40, 60%, 98%)',
  fontFamily: '"DM Sans", Helvetica, Arial, sans-serif',
  color: 'hsl(350, 25%, 12%)',
  margin: 0,
  padding: '32px 0',
}
const container = {
  backgroundColor: '#ffffff',
  border: '1px solid hsl(38, 35%, 90%)',
  borderRadius: '10px',
  margin: '0 auto',
  maxWidth: '560px',
  padding: '36px 40px',
}
const header = { textAlign: 'center' as const, marginBottom: '24px' }
const brand = {
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: '20px',
  fontWeight: 700 as const,
  letterSpacing: '0.18em',
  color: 'hsl(350, 45%, 22%)',
  margin: 0,
}
const tagline = {
  fontSize: '12px',
  color: 'hsl(42, 80%, 35%)',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  margin: '6px 0 0',
}
const h1 = {
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: '28px',
  fontWeight: 700 as const,
  color: 'hsl(350, 45%, 22%)',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}
const text = {
  fontSize: '15px',
  color: 'hsl(350, 12%, 35%)',
  lineHeight: 1.6,
  margin: '0 0 24px',
}
const link = { color: 'hsl(350, 45%, 22%)', textDecoration: 'underline' }
const buttonWrap = { textAlign: 'center' as const, margin: '8px 0 16px' }
const button = {
  backgroundColor: 'hsl(350, 45%, 22%)',
  color: 'hsl(40, 60%, 98%)',
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '10px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: 'hsl(38, 35%, 90%)', margin: '32px 0 20px' }
const verse = {
  fontFamily: '"Playfair Display", Georgia, serif',
  fontStyle: 'italic' as const,
  fontSize: '14px',
  color: 'hsl(42, 80%, 30%)',
  textAlign: 'center' as const,
  margin: '0 0 20px',
}
const footer = {
  fontSize: '12px',
  color: 'hsl(350, 12%, 48%)',
  textAlign: 'center' as const,
  margin: 0,
  lineHeight: 1.6,
}
const footerLink = { color: 'hsl(350, 45%, 22%)', textDecoration: 'none' }
