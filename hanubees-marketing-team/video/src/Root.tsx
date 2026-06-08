import { Composition } from "remotion";
import { ShockStat, type ShockStatProps, FPS, DURATION } from "./ShockStat";
import { HookVideo, type HookVideoProps, totalFrames } from "./HookVideo";

const shockDefaults: ShockStatProps = {
  city: "Coimbatore", total: 551, noPhone: 358, noSite: 300, reachable: 193, pct: 65, music: "drive",
};

const hookDefaults: HookVideoProps = {
  id: "c01", emotion: "frustration", music: "tense",
  hook: "Are you still calling 6 shops to find ONE thing?",
  scenes: [
    { big: "6", text: "shops called", emoji: "📞" },
    { big: "0", text: "actually picked up", emoji: "🦗" },
    { text: "I asked ONE bee. Got every answer.", emoji: "🐝" },
  ],
  cta: "Stop dialing. Just ask.",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="ShockStat" component={ShockStat} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={shockDefaults} />
      <Composition
        id="HookVideo"
        component={HookVideo}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={hookDefaults}
        calculateMetadata={({ props }) => ({ durationInFrames: totalFrames(props) })}
      />
    </>
  );
};
