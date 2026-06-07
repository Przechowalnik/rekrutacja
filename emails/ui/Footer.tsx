import {
  Column,
  Container,
  Img,
  Link,
  Markdown,
  Row,
} from "@react-email/components";
import dayjs from "dayjs";
import { TFunction } from "i18next";

import { links } from "../links";
import { linkSocials, linkTerms } from "./styles.server";

export type T_Footer = {
  t: TFunction<"emails", undefined>;
};

export const Footer = ({ t }: T_Footer) => {
  const currentYear = dayjs().get("year");

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
            color: "#4422aa",
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
          backgroundColor: "#F1EEFC",
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
            <Img
              alt="Maszbox logo"
              height={32}
              src={`${t("company.link")}/logo/logo-light.png`}
            />
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
              companyAddress: t("company.address"),
              companyName: t("company.name"),
              companyTaxId: t("company.taxId"),
              currentYear: currentYear,
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
            <Link href={links.facebook.url} style={linkSocials}>
              <Img
                alt="Facebook logo"
                height={32}
                src={`${t("company.link")}/icons/fb.png`}
              />
            </Link>
            <Link href={links.instagram} style={linkSocials}>
              <Img
                alt="Instagram logo"
                height={32}
                src={`${t("company.link")}/icons/instagram.png`}
              />
            </Link>
            <Link href={links.tiktok} style={linkSocials}>
              <Img
                alt="Tiktok logo"
                height={32}
                src={`${t("company.link")}/icons/tiktok.png`}
              />
            </Link>
            <Link href={t("company.link")} style={linkSocials}>
              <Img
                alt="X logo"
                height={32}
                src={`${t("company.link")}/icons/website.png`}
              />
            </Link>
          </Column>
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
            <Link href={`${t("company.link")}/konto/zgody`} style={linkTerms}>
              {t("footer.unsubscribe")}
            </Link>
          </Column>
        </Row>
      </Container>
    </>
  );
};
