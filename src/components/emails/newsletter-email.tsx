import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface NewsletterEmailProps {
  type: "new_arrival" | "back_in_stock";
  productName: string;
  productImage: string;
  productPrice: number;
  productUrl: string;
}

export const NewsletterEmail = ({
  type,
  productName,
  productImage,
  productPrice,
  productUrl,
}: NewsletterEmailProps) => {
  const isNew = type === "new_arrival";
  const previewText = isNew 
    ? `New Arrival: Discover ${productName} at Silk Haus.` 
    : `${productName} is back in stock!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
             <Text style={logo}>SILK HAUS</Text>
             <Text style={subtitle}>ELITE STUDIO</Text>
          </Section>

          <Section style={imageSection}>
            <Img
              src={productImage}
              width="100%"
              alt={productName}
              style={productImg}
            />
          </Section>

          <Section style={content}>
            <Heading style={heading}>
              {isNew ? "A New Masterpiece Arrives." : "Returned by Popular Demand."}
            </Heading>
            <Text style={description}>
              {isNew 
                ? `We are pleased to introduce "${productName}" to our curated collection. A testament to luxury and fine craftsmanship.`
                : `The wait is over. our highly-coveted "${productName}" is now back in stock and ready for immediate dispatch.`
              }
            </Text>
            
            <Section style={priceSection}>
              <Text style={priceLabel}>Direct from Atelier</Text>
              <Text style={priceValue}>£{productPrice}</Text>
            </Section>

            <Link href={productUrl} style={button}>
              {isNew ? "Discover the Piece" : "Secure Yours Now"}
            </Link>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} Silk Haus. All Rights Reserved.<br />
              London | Lagos | Global
            </Text>
            <Text style={address}>
              You received this email because you subscribed to the Silk Haus newsletter.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NewsletterEmail;

const main = {
  backgroundColor: "#0A0A0A",
  color: "#FFFFFF",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  width: "600px",
  backgroundColor: "#141414",
  border: "1px solid #2A2A2D",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "40px",
};

const logo = {
  fontSize: "28px",
  fontWeight: "bold",
  letterSpacing: "0.2em",
  margin: "0",
  color: "#D5A754",
};

const subtitle = {
  fontSize: "10px",
  letterSpacing: "0.4em",
  margin: "10px 0 0",
  color: "#888",
  textTransform: "uppercase" as const,
};

const imageSection = {
  marginBottom: "40px",
};

const productImg = {
  borderRadius: "2px",
  border: "1px solid #2A2A2D",
  objectFit: "cover" as const,
};

const content = {
  textAlign: "center" as const,
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "20px",
  letterSpacing: "-0.02em",
  color: "#FFF",
};

const description = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#AAA",
  marginBottom: "30px",
};

const priceSection = {
  marginBottom: "30px",
  backgroundColor: "#1A1A1D",
  padding: "20px",
  border: "1px solid #2A2A2D",
};

const priceLabel = {
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
  color: "#D5A754",
  margin: "0 0 5px",
};

const priceValue = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const button = {
  backgroundColor: "#D5A754",
  color: "#000",
  padding: "18px 32px",
  textDecoration: "none",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
  display: "inline-block",
  borderRadius: "2px",
};

const hr = {
  borderColor: "#2A2A2D",
  margin: "40px 0",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "11px",
  color: "#666",
  letterSpacing: "0.1em",
  lineHeight: "1.6",
  textTransform: "uppercase" as const,
};

const address = {
  fontSize: "10px",
  color: "#444",
  marginTop: "20px",
};
