/*
 *
 * Helper: `getCaptchaImageUrl`.
 *
 */
const getCaptchaImageUrl = async (page) => {
  // Get the page origin (e.g., https://purchasingprogramsaudi.com)
  const origin = new URL(page.url()).origin;

  // Evaluate the page to extract the image src
  const relativeSrc = await page.$eval("#CAPTCHAfrm img", (img) =>
    img.getAttribute("src")
  );

  // If it's already an absolute URL, return it as is
  if (relativeSrc.startsWith("http://") || relativeSrc.startsWith("https://")) {
    return relativeSrc;
  }

  // Otherwise, construct the full URL relative to origin
  return new URL(relativeSrc, origin).href;
};

export default getCaptchaImageUrl;
