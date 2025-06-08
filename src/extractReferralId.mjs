/*
 *
 * Helper: `extractReferralId`.
 *
 */
const extractReferralId = (text) => {
  if (!text) return "";

  const [, referralId] = text.match(/\*Referral ID\*:\s*([^\n\r]+)/) || [];
  return referralId;
};

export default extractReferralId;
