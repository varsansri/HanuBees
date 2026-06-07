import { Composition } from "remotion";
import { ShockStat, type ShockStatProps, FPS, DURATION } from "./ShockStat";

// Sensible defaults (also the Studio preview). Real numbers are injected at render
// time via --props=out/props.json (built by scripts/fetch-data.js from the live DB).
const defaultProps: ShockStatProps = {
  city: "Coimbatore",
  total: 551,
  noPhone: 358,
  noSite: 300,
  reachable: 193,
  pct: 65,
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ShockStat"
      component={ShockStat}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
};
