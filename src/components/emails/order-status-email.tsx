import * as React from 'react';
import { Html, Head, Body, Container, Text, Section, Link, Hr, Img } from '@react-email/components';

interface OrderStatusEmailProps {
  customerName: string;
  orderId: string;
  newStatus: string;
}

export const OrderStatusEmail: React.FC<Readonly<OrderStatusEmailProps>> = ({
  customerName,
  orderId,
  newStatus,
}) => {
  const isShipped = newStatus.toLowerCase() === 'shipped';
  
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A0A0A', color: '#ffffff', fontFamily: 'sans-serif', margin: '0 auto', padding: '40px 20px' }}>
        <Container style={{ backgroundColor: '#141414', border: '1px solid #2A2A2D', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <Text style={{ color: '#D5A754', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', margin: '0 0 30px' }}>
            SILK HAUS
          </Text>
          
          <Text style={{ fontSize: '16px', lineHeight: '24px', margin: '0 0 20px' }}>
            Hello {customerName},
          </Text>
          
          <Text style={{ fontSize: '16px', lineHeight: '24px', margin: '0 0 30px' }}>
            The status of your luxury order (<strong>#{orderId.substring(0, 8)}</strong>) has been updated to: <strong style={{ color: '#D5A754', textTransform: 'uppercase' }}>{newStatus}</strong>.
          </Text>

          {isShipped && (
            <Text style={{ fontSize: '16px', lineHeight: '24px', margin: '0 0 30px', color: '#a1a1aa' }}>
              Your order is now on its way! Please check your client dashboard for any tracking details.
            </Text>
          )}

          <Section style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link 
              href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/orders`}
              style={{ backgroundColor: '#D5A754', color: '#000000', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block' }}
            >
              View Order in Dashboard
            </Link>
          </Section>

          <Hr style={{ borderColor: '#2A2A2D', margin: '40px 0' }} />
          
          <Text style={{ fontSize: '12px', color: '#a1a1aa', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
            © {new Date().getFullYear()} Silk Haus. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderStatusEmail;
