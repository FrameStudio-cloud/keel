import { useContext } from "react";
import { SettingsContext } from "../context/settingsContext";

export function useSettings() {
  return useContext(SettingsContext);
}
