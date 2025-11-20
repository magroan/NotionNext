export const handleEmailClick = (e, emailIcon, CONTACT_EMAIL) => {
  if (CONTACT_EMAIL && emailIcon && !emailIcon.current.href) {
    e.preventDefault();
    const email = decryptEmail(CONTACT_EMAIL);
    emailIcon.current.href = `mailto:${email}`;
    emailIcon.current.click();
  }
};

export const encryptEmail = (email) => {
  return btoa(unescape(encodeURIComponent(email)));
};

export const decryptEmail = (encryptedEmail) => {
  try {
    return decodeURIComponent(escape(atob(encryptedEmail)));
  } catch (error) {
    console.error("\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306E\u89E3\u8AAD\u306B\u5931\u6557\u3057\u307E\u3057\u305F:", error);
    return encryptedEmail;
  }
};