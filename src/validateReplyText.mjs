/*
 *
 * Helper: `validateReplyText`.
 *
 */
const validateReplyText = (text) => {
  const lower = (text || "").toLowerCase().trim();

  if (["accept", "1"].includes(lower)) {
    return {
      isAcceptance: true,
    };
  }

  if (["cancel", "0"].includes(lower)) {
    return {
      isCancellation: true,
    };
  }

  if (["reject", "00"].includes(lower)) {
    return {
      isRejection: true,
    };
  }

  return {};
};

export default validateReplyText;
