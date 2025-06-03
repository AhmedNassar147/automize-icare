/*
 *
 * Helper: `makeUserLoggedInOrOpenHomePage`.
 *
 */
const makeUserLoggedInOrOpenHomePage = async ({
  browser,
  userName,
  password,
}) => {
  const page = await browser.newPage();

  try {
    await page.goto("https://purchasingprogramsaudi.com/Index.cfm", {
      waitUntil: "networkidle2",
    });

    const isLoginPage = await page.evaluate(() => {
      const loginFormElement = document.getElementById("div-login-form");

      return !!loginFormElement;
    });

    if (isLoginPage) {
      await page.type("#j_username", userName);
      await page.type("#j_password", password);

      await Promise.all([
        page.waitForNavigation({
          waitUntil: ["load", "networkidle2"],
          timeout: 60 * 1000, // 1 minute
        }),
        page.click("#btnLogin"),
      ]);
    }

    let homePageHeaderElement;

    try {
      // 2. Wait for an element that indicates login success
      homePageHeaderElement = await page.waitForSelector(
        "#icare_global_header_menu",
        {
          timeout: 2 * 60 * 1000, // 2 minutes
        }
      );
    } catch (error) {}

    if (homePageHeaderElement) {
      const message = isLoginPage
        ? `✅ Then User ${userName} is logged in, And we are in the home page`
        : `✅ Then User ${userName} is already logged in, And we are in the home page`;
      console.log(message);
      return [page, true];
    } else {
      console.warn(
        `⚠️ User ${userName} might not be logged in — We Are not in home page.`
      );
      return [page, false];
    }
  } catch (error) {
    console.error(`❌ Login failed for user ${userName}:`, error.message);
    return [page, false];
  }
};

export default makeUserLoggedInOrOpenHomePage;
