/*
 *
 * Helper: `goBack`.
 *
 */

// <div id="icare_global_header_logo" style="float:left;">
//  <a style="cursor:pointer;" alt="i*care logo" onclick="ColdFusion.navigate('Assistance/MohDashboard.cfm','WorkArea');">
//    <img src="images/MOHlogo.png" border="0" style="cursor:pointer;" alt="i*care logo" onclick="document.getElementById('nav').style.display='';">
//  </a>
// </div>

const goBack = async (page) =>
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }), // The promise resolves after navigation has finished
    page.click("#icare_global_header_logo a"),
  ]);

export default goBack;
