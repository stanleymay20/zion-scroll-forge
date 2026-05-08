/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps { token: string }

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your ScrollUniversity verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}><Text style={brand}>SCROLLUNIVERSITY</Text></Section>
        <Heading style={h1}>Confirm it's you</Heading>
        <Text style={text}>Use this code to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Hr style={hr} />
        <Text style={footer}>This code expires shortly. If you didn't request it, ignore this email.</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: 'hsl(40, 60%, 98%)', fontFamily: '"DM Sans", Helvetica, Arial, sans-serif', color: 'hsl(350, 25%, 12%)', margin: 0, padding: '32px 0' }
const container = { backgroundColor: '#ffffff', border: '1px solid hsl(38, 35%, 90%)', borderRadius: '10px', margin: '0 auto', maxWidth: '560px', padding: '36px 40px', textAlign: 'center' as const }
const header = { textAlign: 'center' as const, marginBottom: '24px' }
const brand = { fontFamily: '"Playfair Display", Georgia, serif', fontSize: '20px', fontWeight: 700 as const, letterSpacing: '0.18em', color: 'hsl(350, 45%, 22%)', margin: 0 }
const h1 = { fontFamily: '"Playfair Display", Georgia, serif', fontSize: '26px', fontWeight: 700 as const, color: 'hsl(350, 45%, 22%)', margin: '0 0 12px' }
const text = { fontSize: '15px', color: 'hsl(350, 12%, 35%)', lineHeight: 1.6, margin: '0 0 16px' }
const codeStyle = { fontFamily: '"Playfair Display", Georgia, serif', fontSize: '32px', fontWeight: 700 as const, letterSpacing: '0.4em', color: 'hsl(42, 80%, 35%)', backgroundColor: 'hsl(38, 35%, 96%)', borderRadius: '10px', padding: '18px 12px', margin: '0 0 24px' }
const hr = { borderColor: 'hsl(38, 35%, 90%)', margin: '24px 0 16px' }
const footer = { fontSize: '12px', color: 'hsl(350, 12%, 48%)', margin: 0, lineHeight: 1.6 }
