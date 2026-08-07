import { PROVISIONER_URL } from "./constants";

let manifestCache = null;
let manifestPromise = null;

export function fetchTemplateManifest() {
  if (manifestCache) return Promise.resolve(manifestCache);
  if (!manifestPromise) {
    manifestPromise = (async () => {
      try {
        const res = await fetch(`${PROVISIONER_URL}/templates`);
        if (!res.ok) return null;
        const data = await res.json();
        manifestCache = data;
        return data;
      } catch {
        manifestCache = null;
        return null;
      }
    })();
  }
  return manifestPromise;
}

export function resolveProvisionerTemplateId(templateId, provisionerTemplateId) {
  if (!manifestCache?.templates?.length) return provisionerTemplateId;
  const ids = new Set(manifestCache.templates.map((t) => t.id));
  if (ids.has(provisionerTemplateId)) return provisionerTemplateId;
  const aliases = manifestCache.aliases || {};
  const aliasTarget = aliases[provisionerTemplateId];
  if (aliasTarget && ids.has(aliasTarget)) return aliasTarget;
  return ids.has("classic") ? "classic" : provisionerTemplateId;
}
