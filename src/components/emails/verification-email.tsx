import * as React from 'react';
import { Html, Head, Body, Container, Text, Section, Link, Hr, Img } from '@react-email/components';

interface VerificationEmailProps {
  customerName: string;
}

export const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({
  customerName,
}) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A0A0A', color: '#ffffff', fontFamily: 'sans-serif', margin: '0 auto', padding: '40px 20px' }}>
        <Container style={{ backgroundColor: '#141414', border: '1px solid #2A2A2D', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <Text style={{ color: '#D5A754', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center', margin: '0 0 10px' }}>
            Welcome to Elite Luxury
          </Text>
          <Text style={{ color: '#ffffff', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px', letterSpacing: '1px' }}>
            SILK HAUS BY FOLLIEN
          </Text>
          
          <Text style={{ fontSize: '16px', lineHeight: '24px', margin: '0 0 20px' }}>
            Hello {customerName},
          </Text>
          
          <Text style={{ fontSize: '16px', lineHeight: '24px', margin: '0 0 20px', color: '#a1a1aa' }}>
            Thank you for joining our exclusive circle. Your journey into high-end luxury hair craftsmanship begins here.
          </Text>

          <Section style={{ backgroundColor: '#0A0A0A', padding: '30px', border: '1px solid #D5A754', margin: '30px 0', textAlign: 'center' }}>
            <Text style={{ fontSize: '14px', color: '#D5A754', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 15px' }}>
              Action Required: Activate Your Membership
            </Text>
            <Text style={{ fontSize: '15px', color: '#ffffff', lineHeight: '22px', margin: '0 0 20px' }}>
              We have sent a secure activation link to your email address from our authentication provider. Please click that link to verify your identity and unlock your dashboard.
            </Text>
            <Link 
              href={`${process.env.NEXT_PUBLIC_SITE_URL}/login`}
              style={{ backgroundColor: '#D5A754', color: '#000000', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block' }}
            >
              Go to Login
            </Link>
          </Section>

          <Text style={{ fontSize: '14px', lineHeight: '22px', color: '#a1a1aa' }}>
            Once verified, you will have access to:
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Curated recommendations tailored for your style</li>
              <li>Priority track for new product arrivals</li>
              <li>Elite studio maintenance tracking for your luxury units</li>
            </ul>
          </Text>

          <Hr style={{ borderColor: '#2A2A2D', margin: '40px 0' }} />
          
          <Text style={{ fontSize: '12px', color: '#666', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
            © {new Date().getFullYear()} Silk Haus Elite Studio. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;
