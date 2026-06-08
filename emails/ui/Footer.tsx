import { Column, Container, Link, Markdown, Row } from "@react-email/components";
import { TFunction } from "i18next";

import { linkTerms } from "./styles.server";

export type T_Footer = {
  t: TFunction<"emails", undefined>;
};

export const Footer = ({ t }: T_Footer) => {
  return (
    <>
      <Markdown
        markdownContainerStyles={{
          marginBottom: "40px",
          textAlign: "center",
        }}
        markdownCustomStyles={{
          codeInline: { fontWeight: "bold" },
          link: {
            color: "#2563eb",
            display: "inline",
            fontSize: "18px",
            fontWeight: 700,
            margin: 0,
            textDecoration: "underline",
          },
          p: {
            display: "inline",
            fontSize: "18px",
            lineHeight: "28px",
          },
        }}
      >
        {t("footer.faq")}
      </Markdown>
      <Container
        align="center"
        style={{
          backgroundColor: "#eff6ff",
          maxWidth: "100%",
          padding: "32px",
          width: "100%",
        }}
      >
        <Row>
          <Column
            align="center"
            style={{
              paddingBottom: "24px",
            }}
          >
            <Link
              href={t("company.link")}
              style={{
                color: "#2563eb",
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                textDecoration: "none",
              }}
            >
              do-pracy.pl
            </Link>
          </Column>
        </Row>
        <Row>
          <Markdown
            markdownContainerStyles={{
              marginBottom: "32px",
              textAlign: "center",
            }}
            markdownCustomStyles={{
              p: {
                fontSize: "14px",
                margin: 0,
              },
            }}
          >
            {t("footer.content", {
              companyName: t("company.name"),
            })}
          </Markdown>
        </Row>
        <Row>
          <Column
            align="center"
            style={{
              paddingBottom: "12px",
            }}
          >
            <Link
              href={`${t("company.link")}/terms-and-conditions`}
              style={linkTerms}
            >
              {t("footer.termsAndCondition")}
            </Link>
            <Link
              href={`${t("company.link")}/privacy-policy`}
              style={linkTerms}
            >
              {t("footer.policyPrivacy")}
            </Link>
          </Column>
        </Row>
      </Container>
    </>
  );
};
