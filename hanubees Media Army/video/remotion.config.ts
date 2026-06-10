import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// GitHub Actions runners need these flags for headless Chrome.
Config.setChromiumOpenGlRenderer("angle");
