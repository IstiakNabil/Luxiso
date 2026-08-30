/**
 * Sustainability page content, transcribed from the Figma
 * frames (Desktop/Sustainability/01 node 1:2903 and /02).
 * Static marketing content — no backend.
 *
 * Images in the design are Figma-hosted and not part of the
 * project, so the page uses labelled placeholders. Drop real
 * images into /src/assets and swap the placeholders when ready.
 */

export const SUSTAINABILITY_INTRO = {
  heading: "Sustainability at Loomino",
  lead:
    "At Loomino, sustainability is at the heart of everything we do. Our brand identity, characterized by its simplicity and elegance, is a reflection of our commitment to a more sustainable future.",
  body:
    "Guided by our core missions, we intertwine sustainability into every thread of our brand — from thoughtfully sourced materials and innovative manufacturing processes to nurturing product longevity and embracing eco-friendly packaging — all harmonizing to create a more meaningful and responsible approach to fashion.",
  heroTagline: "Elegance in simplicity, Earth's harmony",
};

export interface Mission {
  title: string;
  body: string;
}

export const MISSIONS: Mission[] = [
  {
    title: "Minimalism",
    body: "We believe less is more. Our thoughtfully designed pieces embrace minimalism, ensuring that each garment becomes a versatile and timeless addition to your wardrobe. By choosing quality over quantity, we encourage conscious consumption.",
  },
  {
    title: "Ethical",
    body: "Every stitch tells a story. Our garments are meticulously crafted by skilled artisans who share our values of ethical and fair labor practices. This dedication to craftsmanship not only ensures exceptional quality but also supports a network of talented individuals.",
  },
  {
    title: "Eco-Friendly Materials",
    body: "We are dedicated to reducing our environmental impact. Our clothing is made using sustainable materials, carefully sourced to minimize harm to the planet. From organic fabrics to innovative recycled materials, we aim to leave a lighter footprint.",
  },
  {
    title: "Circular",
    body: "Embracing the circular economy, we design with longevity in mind. Our pieces are intended to be treasured for years, encouraging a shift away from disposable fashion. When you invest in our clothing, you're investing in a more sustainable future.",
  },
  {
    title: "Transparency",
    body: "We value openness and transparency. We're on a journey to continuously improve our practices, and we're committed to sharing our progress with you. From sourcing to production, we want you to know the story behind each piece you wear.",
  },
  {
    title: "Community and Empowerment",
    body: "Our brand is part of a community that shares a vision for a better world. Through collaborations and initiatives, we aim to inspire and empower individuals to make conscious choices and contribute to positive change.",
  },
];

export const PILLARS = [
  "Processing",
  "Materials",
  "Packaging",
  "Product Caring",
];

export const SUPPLIERS_QUOTE =
  "\"With every step, our quest for sustainability is fortified by our trusted suppliers, united in our shared dedication to ethical craftsmanship and a more conscious future.\"";

export const CLOSING_STATEMENT =
  "With Loomino, you're not just wearing fashion — you're making a statement. A statement that elegance and sustainability can coexist, shaping a more responsible and beautiful future for us all.";
