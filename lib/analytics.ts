// Analytics tracking for Hanubees v1
// Integrates PostHog (product analytics) + Umami (web analytics)

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // PostHog
  if (typeof window !== "undefined" && (window as any).posthog) {
    (window as any).posthog.capture(eventName, properties);
  }

  // Umami
  if (typeof window !== "undefined" && (window as any).umami) {
    (window as any).umami.track(eventName, properties);
  }
}

// Owner events
export const analytics = {
  // Chat
  chatMessageSent: (wordCount: number) =>
    trackEvent("chat_message_sent", { word_count: wordCount }),
  factStored: (infoType: string, isLiveFact: boolean) =>
    trackEvent("fact_stored", { info_type: infoType, is_live_fact: isLiveFact }),

  // Messages
  messageViewed: (conversationId: string) =>
    trackEvent("message_viewed", { conversation_id: conversationId }),
  messageFulfilled: (conversationId: string) =>
    trackEvent("message_fulfilled", { conversation_id: conversationId }),
  messageMarkedImportant: (conversationId: string) =>
    trackEvent("message_marked_important", { conversation_id: conversationId }),

  // Profile
  profileEntryAdded: (section: string, infoType?: string) =>
    trackEvent("profile_entry_added", { section, info_type: infoType }),
  profileEntryDeleted: (section: string) =>
    trackEvent("profile_entry_deleted", { section }),
  profileEntryUpdated: (section: string, infoType?: string) =>
    trackEvent("profile_entry_updated", { section, info_type: infoType }),

  // Onboarding
  onboardingStarted: () => trackEvent("onboarding_started"),
  onboardingStepCompleted: (step: number, action: string) =>
    trackEvent("onboarding_step_completed", { step, action }),
  onboardingCompleted: (accountType: string) =>
    trackEvent("onboarding_completed", { account_type: accountType }),

  // Dashboard
  dashboardViewed: () => trackEvent("dashboard_viewed"),

  // Public
  publicPageViewed: (beeName: string) =>
    trackEvent("public_page_viewed", { bee_name: beeName }),
  customerQuestionAsked: (beeName: string, wordCount: number) =>
    trackEvent("customer_question_asked", { bee_name: beeName, word_count: wordCount }),
  agentAnswerProvided: (beeName: string, answerLength: number, confidence?: number) =>
    trackEvent("agent_answer_provided", {
      bee_name: beeName,
      answer_length: answerLength,
      confidence,
    }),

  // AI errors
  llmFallbackTriggered: (reason: string) =>
    trackEvent("llm_fallback_triggered", { reason }),
  embedError: (error: string) =>
    trackEvent("embed_error", { error }),

  // Voice
  voiceInputStarted: () => trackEvent("voice_input_started"),
  voiceInputCompleted: (transcript: string) =>
    trackEvent("voice_input_completed", { transcript_length: transcript.length }),
  voiceInputFailed: (error: string) =>
    trackEvent("voice_input_failed", { error }),

  // Bee ball
  beeBallDragged: (distancePx: number) =>
    trackEvent("bee_ball_dragged", { distance_px: distancePx }),
  beeBallTapped: () => trackEvent("bee_ball_tapped"),

  // Cache hits
  cacheHit: (page: string) => trackEvent("cache_hit", { page }),
  cacheMiss: (page: string) => trackEvent("cache_miss", { page }),

  // User properties (for segmentation)
  setUserProperties: (userId: string, properties: Record<string, any>) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.identify(userId, properties);
    }
  },
};
