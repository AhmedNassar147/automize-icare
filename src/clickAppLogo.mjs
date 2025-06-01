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

const clickAppLogo = async (page) =>
  await Promise.all([
    page.waitForNetworkIdle(),
    page.click("#icare_global_header_logo a"),
  ]);

export default clickAppLogo;
