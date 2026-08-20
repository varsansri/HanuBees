export const unruledTheme = {
  identity: {
    name: "Unruled",
    collection: "Drop 001",
    tagline: "Uniforms for independent minds. Built heavy. Worn loose.",
  },
  palette: {
    black: "#050505",
    ink: "#11110f",
    paper: "#f2f0ea",
    smoke: "#9d9c97",
    signal: "#e8ff45",
    rust: "#b54f2c",
  },
  typography: {
    display: "Arial Black, Helvetica Neue, Arial, sans-serif",
    body: "Helvetica Neue, Arial, sans-serif",
    mono: "SFMono-Regular, Consolas, Liberation Mono, monospace",
  },
  motion: {
    fast: "180ms",
    base: "460ms",
    slow: "900ms",
    easing: "cubic-bezier(.2,.75,.2,1)",
    reducedMotion: true,
  },
  sections: [
    "announcement",
    "masthead",
    "campaignHero",
    "limitedDrop",
    "collectionTicker",
    "missionStory",
    "visionStory",
    "newsletter",
    "footer",
  ],
  integrations: {
    cart: "demo-state",
    search: "demo-interface",
    newsletter: "demo-form",
  },
} as const;

