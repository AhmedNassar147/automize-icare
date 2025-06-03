/*
 *
 * Helper: `processSendCollectedPatientsToWhatsapp`.
 *
 */
const processSendCollectedPatientsToWhatsapp =
  (sendWhatsappMessage, whatsappNumber) => async (addedPatients) => {
    console.log("addedPatients started, posting patients to WhatsApp...");

    // Format the message
    const formatPatient = (
      {
        adherentName,
        nationality,
        nationalId,
        referralType,
        requiredSpecialty,
        providerSourceName,
        sourceZone,
        requestedDate,
        referralId,
        files,
      },
      i
    ) => {
      const message =
        `🧾 Patient ${referralId}:\n` +
        `────────────────────────────\n` +
        `👤 Name: ${adherentName}\n` +
        `🌐 Nationality: ${nationality}\n` +
        `🆔 National ID: ${nationalId}\n` +
        `🔢 Referral ID: ${referralId}\n` +
        `🏷️ Referral Type: ${referralType}\n` +
        `🧑‍⚕️ Specialty: ${requiredSpecialty}\n` +
        `🏥 Provider: ${providerSourceName}\n` +
        `📍 Zone: ${sourceZone}\n` +
        `📅 Requested: ${requestedDate}\n`;

      return {
        message,
        files: files,
      };
    };

    await sendWhatsappMessage(whatsappNumber, addedPatients.map(formatPatient));
  };

export default processSendCollectedPatientsToWhatsapp;
