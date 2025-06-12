/*
 *
 * helper: `getCaptchaResponsePromiseFromPage`.
 *
 */
const getCaptchaResponsePromiseFromPage = (page) =>
  new Promise((resolve) => {
    let timeoutId;

    const onResponse = async (response) => {
      try {
        const url = response.url();
        if (url.includes("/CFFileServlet/_cf_captcha")) {
          page.off("response", onResponse);
          clearTimeout(timeoutId);

          // Extract extension from URL, e.g., .png, .jpg
          const extensionMatch =
            url.match(/\.(png|jpg|jpeg|gif|bmp|webp)(\?|$)/i) || [];
          const [, extension] = extensionMatch;

          const buffer = await response.buffer();
          const captchaBase64 = buffer.toString("base64");

          resolve({
            captchaBase64,
            captchaExtension: (extension || "png").toLowerCase(),
          });
        }
      } catch (err) {
        // optionally log or handle error
        resolve(null);
      }
    };

    page.on("response", onResponse);

    timeoutId = setTimeout(() => {
      page.off("response", onResponse);
      resolve(null);
    }, 6000);
  });

export default getCaptchaResponsePromiseFromPage;
