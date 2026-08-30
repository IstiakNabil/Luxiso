export interface FaqOption {
  label: string;
  detail: string;
}

export interface FaqItem {
  question: string;
  /** Plain-text answer. Optional when `options` is used instead. */
  answer?: string;
  /**
   * Structured sub-items (e.g. care instructions broken out by
   * fabric type) rendered as a labeled list under the answer.
   */
  options?: FaqOption[];
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
      "We accept Cash on Delivery and payments through our SSL Gateway. You can choose your preferred method at checkout.",
  },
  {
    question: "Which size will fit me best?",
    answer:
      "We offer product and body measurements on each of our product pages — just click on \"Size Guide\" to find your best fit. Measuring guides are included.",
  },
  {
    question: "Fabric Care Info — how do I take care of my Loomino pieces?",
    answer:
      "Every piece is different, so always check the care label sewn into the garment first — it overrides the general guidance below. When in doubt, a gentle hand wash and air dry is the safest option for anything embellished or delicately woven.",
    options: [
      {
        label: "Cotton & Cotton Blends",
        detail:
          "Machine wash cold on a gentle cycle with similar colors, or hand wash. Line dry in shade to prevent fading. Warm iron on the reverse side if needed.",
      },
      {
        label: "Silk & Georgette",
        detail:
          "Hand wash cold with a mild detergent, or dry clean for best results. Do not wring — gently press out water and lay flat to dry, away from direct sunlight. Iron on low heat with a pressing cloth.",
      },
      {
        label: "Chiffon & Sheer Fabrics",
        detail:
          "Hand wash cold separately, as these fabrics are delicate and prone to snagging. Air dry on a padded hanger. Iron on the lowest heat setting, or steam instead of ironing directly.",
      },
      {
        label: "Linen",
        detail:
          "Machine wash cold on a gentle cycle, or hand wash. Reshape while damp and air dry — linen wrinkles easily, so iron while still slightly damp for the smoothest finish.",
      },
      {
        label: "Embellished, Embroidered & Sequined Pieces",
        detail:
          "Always hand wash cold, inside out, and never wring or twist. Air dry flat away from direct heat and sunlight. Do not iron directly over embellishments — iron the reverse side only, or steam from a distance.",
      },
      {
        label: "General Dos & Don'ts",
        detail:
          "Do wash in cold water and air dry out of direct sunlight to preserve color. Don't use bleach, fabric softener, or a tumble dryer on any Loomino piece — these can damage embroidery, sequins, and delicate weaves over time.",
      },
    ],
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
