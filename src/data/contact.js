// ONE PLACE for all contact details. Fill these in and every icon/link on the site
// (footer, checkout page, order-confirmation popup) updates automatically.
// Leave a value as "" and its icon simply does nothing when clicked.
export const CONTACT = {
  phone: "",        // e.g. "01XXXXXXXXX"  -> call icon (tel:)
  whatsapp: "",     // number with country code, digits only, e.g. "8801XXXXXXXXX"
  instagram: "",    // username only, e.g. "fortunebarishal"
  messenger: "",    // Facebook page username, e.g. "fortunebarishal"
  email: "info@fortunebarisal.com",
  address: "Barishal, Bangladesh",
};

const clean = (v) => String(v || "").replace(/^@/, "").trim();
export const LINKS = {
  whatsapp: CONTACT.whatsapp ? `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}` : "",
  instagram: CONTACT.instagram ? `https://instagram.com/${clean(CONTACT.instagram)}` : "",
  messenger: CONTACT.messenger ? `https://m.me/${clean(CONTACT.messenger)}` : "",
  call: CONTACT.phone ? `tel:${CONTACT.phone.replace(/\s/g, "")}` : "",
};
