import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Row,
  Section,
} from "@react-email/components";
import type { PropsWithChildren } from "react";

import { Footer, type T_Footer } from "./ui/Footer";
import { container, head, main } from "./ui/styles.server";

type T_Layout = {
  footer: T_Footer;
  preview: string;
};

export default function Layout({
  children,
  footer,
  preview,
}: PropsWithChildren<T_Layout>) {
  return (
    <Html>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Head />
        <Section style={head}>
          <Row>
            <Column
              align="center"
              style={{
                height: "20px",
                paddingBottom: "22px",
                paddingTop: "22px",
              }}
            >
              <Link
                href={footer.t("company.link")}
                style={{
                  color: "#ffffff",
                  fontSize: "26px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  textDecoration: "none",
                }}
              >
                do-pracy.pl
              </Link>
            </Column>
          </Row>
        </Section>
        <Container style={container}>{children}</Container>
        <Footer {...footer} />
      </Body>
    </Html>
  );
}
