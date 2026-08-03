import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    const key = import.meta.env.VITE_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST,
      person_profiles: 'identified_only',
    });
  }
}

export function track(event, properties = {}) {
  if (posthog.__loaded) posthog.capture(event, properties);
}

export default posthog;
