export type UnruledProduct = {
  id: string;
  name: string;
  edition: string;
  price: number;
  image: string;
  alt: string;
  color: string;
};

export const unruledProducts: UnruledProduct[] = [
  {
    id: "cathedral",
    name: "Cathedral Hoodie",
    edition: "Edition 01 / 40",
    price: 78,
    image: "/themes/unruled/hoodie-arch.png",
    alt: "Black hoodie with an ivory architectural print, shown from behind",
    color: "Ink / Bone",
  },
  {
    id: "orbit",
    name: "Orbit Study Hoodie",
    edition: "Edition 02 / 40",
    price: 82,
    image: "/themes/unruled/hoodie-orbit.png",
    alt: "Washed black hoodie with an orange orbital print, shown from behind",
    color: "Washed black / Rust",
  },
  {
    id: "afterimage",
    name: "Afterimage Hoodie",
    edition: "Edition 03 / 40",
    price: 84,
    image: "/themes/unruled/hoodie-flare.png",
    alt: "Black hoodie with a red and ivory abstract flower print, shown from behind",
    color: "Black / Signal red",
  },
  {
    id: "black-sun",
    name: "Black Sun Hoodie",
    edition: "Edition 04 / 40",
    price: 88,
    image: "/themes/unruled/hoodie-eclipse.png",
    alt: "Black hoodie with an antique gold eclipse print, shown from behind",
    color: "Black / Antique gold",
  },
];

export const unruledThemeTokens = {
  name: "Unruled",
  palette: {
    ink: "#050505",
    paper: "#f2f0ea",
    smoke: "#a4a39f",
    signal: "#e8ff45",
    rust: "#b54f2c",
  },
  type: {
    display: "Arial Black, Helvetica Neue, Arial, sans-serif",
    body: "Helvetica Neue, Arial, sans-serif",
    mono: "SFMono-Regular, Consolas, Liberation Mono, monospace",
  },
  motion: {
    fast: "180ms",
    base: "460ms",
    slow: "900ms",
    ease: "cubic-bezier(.2,.75,.2,1)",
  },
};
