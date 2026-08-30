export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQ content transcribed from the Figma FAQs frame
 * (node 1:2777). Static content — no backend endpoint.
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How do I contact your Customer Service?",
    answer:
      "Our Loomino Customer Service Team is available Monday through Friday, 9am–5pm ET, excluding holidays. You can reach us via email at hello@loomino.com (preferred and our fastest response), via chat using the icon in the bottom-right corner of our website, or via voicemail at +1 (929) 460-3208. We'll make sure to get back to you within 24 business hours.",
  },
  {
    question: "When will my order ship?",
    answer:
      "Orders are processed within 1–2 business days. Once shipped, you'll receive a confirmation email with tracking details so you can follow your order every step of the way.",
  },
  {
    question: "Can I cancel or modify my order?",
    answer:
      "You can cancel or modify an order while it is still Pending or Confirmed from your Orders page. Once an order is processing or shipped, it can no longer be changed — please contact Customer Service and we'll do our best to help.",
  },
  {
    question: "What are my shipping options?",
    answer:
      "We offer free standard shipping on all orders. Estimated delivery times are shown at checkout based on your location.",
  },
  {
    question: "What type of payment methods do you offer?",
    answer:
      "We accept Cash on Delivery, bKash, Nagad, Rocket, SSLCommerz, and card payments. You can choose your preferred method at checkout.",
  },
  {
    question: "Which size will fit me best?",
    answer:
      "We offer product and body measurements on each of our product pages — just click on \"Size Guide\" to find your best fit. Measuring guides are included.",
  },
  {
    question: "How do I take care of my Loomino pieces?",
    answer:
      "Care instructions are listed under \"Fabric & Care\" on every product page. In general, we recommend gentle machine washing and air drying to keep your pieces looking their best.",
  },
  {
    question: "Where and how do you manufacture your products?",
    answer:
      "Our products are made in partnership with carefully selected suppliers who share our commitment to quality and responsible manufacturing.",
  },
  {
    question: "How do you find and evaluate your suppliers?",
    answer:
      "We evaluate suppliers on quality, working conditions, and environmental practices, and we build long-term relationships with partners who meet our standards.",
  },
  {
    question: "How do your suppliers support their workers?",
    answer:
      "Our suppliers provide fair wages and safe working conditions. We work only with partners who treat their workers with dignity and respect.",
  },
];
