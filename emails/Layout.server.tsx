import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
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
              <Img
                alt="Maszbox logo"
                height={32}
                src={`${footer.t("company.link")}/logo/logo-dark.png`}
              />
            </Column>
          </Row>
        </Section>
        <Container style={container}>{children}</Container>
        <Footer {...footer} />
      </Body>
    </Html>
  );
}
