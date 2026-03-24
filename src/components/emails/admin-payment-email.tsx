import * as React from 'react';
import { Html, Head, Body, Container, Text, Section, Link, Hr } from '@react-email/components';

interface AdminPaymentEmailProps {
  customerEmail: string;
  orderId: string;
  amount: number;
  currency: string;
}

export const AdminPaymentEmail: React.FC<Readonly<AdminPaymentEmailProps>> = ({
  customerEmail,
  orderId,
  amount,
  currency,
}) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A0A0A', color: '#ffffff', fontFamily: 'sans-serif', margin: '0 auto', padding: '40px 20px' }}>
        <Container style={{ backgroundColor: '#1A1A1D', border: '1px solid #D5A754', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <Text style={{ color: '#D5A754', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center', margin: '0 0 10px' }}>
            Admin Notification
          </Text>
          <Text style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px' }}>
            New Payment Received!
          </Text>
          
          <Section style={{ backgroundColor: '#0A0A0A', padding: '20px', border: '1px solid #2A2A2D', margin: '0 0 30px' }}>
            <Text style={{ fontSize: '14px', margin: '0 0 10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Order ID: <span style={{ color: '#fff' }}>{orderId}</span>
            </Text>
            <Text style={{ fontSize: '14px', margin: '0 0 10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Customer: <span style={{ color: '#fff' }}>{customerEmail}</span>
            </Text>
            <Text style={{ fontSize: '18px', margin: '0', color: '#D5A754', fontWeight: 'bold' }}>
              Total Paid: {currency.toUpperCase()} {amount}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center' }}>
            <Link 
              href={`${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders`}
              style={{ backgroundColor: '#ffffff', color: '#000000', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block' }}
            >
              Fulfill Order Now
            </Link>
          </Section>

          <Hr style={{ borderColor: '#2A2A2D', margin: '40px 0' }} />
          <Text style={{ fontSize: '10px', color: '#666', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Silk Haus System Auto-Generated Alert
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminPaymentEmail;
