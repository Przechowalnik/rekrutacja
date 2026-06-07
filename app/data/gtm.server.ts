export async function getGtmScript(): Promise<string> {
  const resp = await fetch(
    "https://www.googletagmanager.com/gtm.js?id=GTM-TV3D5LDG",
  );
  const js = await resp.text();

  return js;
}
