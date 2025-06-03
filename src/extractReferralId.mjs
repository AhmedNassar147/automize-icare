/*
 *
 * Helper: `extractReferralId`.
 *
 */
const extractReferralId = (text) => {
  if (!text) {
    return "";
  }

  const [, referralId] = text.match(/Referral ID:\s*([\w\-./$&]+)/) || [];
  return referralId;
};

export default extractReferralId;
