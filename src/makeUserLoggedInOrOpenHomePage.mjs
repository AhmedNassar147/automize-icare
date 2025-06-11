/*
 *
 * Helper: `makeUserLoggedInOrOpenHomePage`.
 *
 */
const ONE_MINUTE_DELAY_MS = 60 * 1000;

const checkIfLoginPage = async (page) =>
  await page.evaluate(() => {
    const loginFormElement = document.getElementById("div-login-form");

    return !!loginFormElement;
  });

const makeUserLoggedInOrOpenHomePage = async (browser, currentPage) => {
  const userName = process.env.CLIENT_NAME;

  const page = currentPage ? currentPage : await browser.newPage();

  if (!currentPage) {
    await page.goto("https://purchasingprogramsaudi.com/Index.cfm", {
      waitUntil: "networkidle2",
      timeout: ONE_MINUTE_DELAY_MS,
    });
  }

  const isLoginPage = await checkIfLoginPage(page);

  if (isLoginPage) {
    await page.type("#j_username", userName);
    await page.type("#j_password", process.env.CLIENT_PASSWORD);

    await Promise.all([
      page.waitForNavigation({
        waitUntil: ["load", "networkidle2"],
        timeout: ONE_MINUTE_DELAY_MS, // 1 minute
      }),
      page.click("#btnLogin"),
    ]);
  }

  const homePageHeaderElement = await page.waitForSelector(
    "#icare_global_header_menu",
    {
      timeout: 2 * ONE_MINUTE_DELAY_MS, // 2 minutes
    }
  );

  if (homePageHeaderElement) {
    const message = isLoginPage
      ? `✅ Making User ${userName} login, And we are in the home page`
      : `✅ The User ${userName} is already logged in, And we are in the home page`;

    console.log(message);
    return [page, true];
  }

  console.warn(
    `⚠️ User ${userName} might not be logged in — We Are not in home page.`
  );

  return [page, false];
};

export default makeUserLoggedInOrOpenHomePage;
