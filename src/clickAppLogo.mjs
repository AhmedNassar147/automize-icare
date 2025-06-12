/*
 *
 * Helper: `clickAppLogo`.
 *
 */
// <div id="icare_global_header_logo" style="float:left;">
//  <a style="cursor:pointer;" alt="i*care logo" onclick="ColdFusion.navigate('Assistance/MohDashboard.cfm','WorkArea');">
//    <img src="images/MOHlogo.png" border="0" style="cursor:pointer;" alt="i*care logo" onclick="document.getElementById('nav').style.display='';">
//  </a>
// </div>

import sleep from "./sleep.mjs";

const clickAppLogo = async (page) => {
  try {
    await page.click("#icare_global_header_logo a");
    await sleep(50000);
  } catch (err) {
    console.warn("⚠️ couldn't find app logo:", err.message);
    // Optional recovery: reload, retry, log, etc.
  }
};

export default clickAppLogo;
