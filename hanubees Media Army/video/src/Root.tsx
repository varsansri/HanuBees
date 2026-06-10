import { Composition } from "remotion";
import { ShockStat, type ShockStatProps, FPS, DURATION } from "./ShockStat";
import { HookVideo, type HookVideoProps, totalFrames } from "./HookVideo";
import { DemoVideo, type DemoVideoProps, demoFrames } from "./DemoVideo";

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

const demoDefaults: DemoVideoProps = {
  id: "d01", emotion: "shock", music: "drive",
  hook: "Getting a local answer should be THIS fast.",
  business: "Hanubees",
  query: "PG with beds free near Gandhipuram under ₹5000?",
  reply: "Yes — Sri Sai PG, Gandhipuram has 2 beds free, ₹4,500/mo, food included.",
  chip: { title: "Sri Sai PG · Gandhipuram", sub: "2 beds free · ₹4,500/mo · food" },
  label1: "Type what you need",
  label2: "Answer in 2 seconds",
  cta: "Ask anything, free.",
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
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={demoDefaults}
        calculateMetadata={() => ({ durationInFrames: demoFrames() })}
      />
    </>
  );
};
