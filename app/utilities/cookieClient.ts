/* eslint-disable unicorn/no-document-cookie */

export function setClientCookie(name: string, value: string): void {
  document.cookie = `${name}=${value}; path=/; SameSite=Strict`;
}

export function clearClientCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`;
}
