import { useState } from "react";
import SectionCard from "./SectionCard";
import { inputClass } from "./settingsStyles";
import { FiMail, FiLock, FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";
import { useToast } from "../../context/ToastProvider";
import { authLogin, authUpdatePassword } from "../../lib/supabase";

function validatePasswordForm(pf) {
  const errors = {};
  if (!pf.currentPassword) errors.currentPassword = "Current password is required";
  if (!pf.newPassword) errors.newPassword = "New password is required";
  else if (pf.newPassword.length < 6) errors.newPassword = "Must be at least 6 characters";
  if (pf.newPassword !== pf.confirmPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
}

export default function SecurityTab({ sessionEmail }) {
  const { showToast } = useToast();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  async function handlePasswordChange() {
    setPasswordError("");
    const errors = validatePasswordForm(passwordForm);
    if (Object.keys(errors).length > 0) {
      setPasswordError(Object.values(errors)[0]);
      return;
    }
    setPasswordSaving(true);
    try {
      if (!sessionEmail) {
        setPasswordError("Could not determine your email. Sign out and back in.");
        setPasswordSaving(false);
        return;
      }
      const loginResult = await authLogin(sessionEmail, passwordForm.currentPassword);
      await authUpdatePassword(loginResult.access_token, passwordForm.newPassword);
      showToast("Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <>
      <SectionCard icon={FiMail} title="Account Email">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-muted flex items-center justify-center">
            <FiMail size={16} className="text-brand" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{sessionEmail || "No email found"}</p>
            <p className="text-[10px] text-text-faint">Signed in account</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={FiLock} title="Change Password">
        <div className="flex flex-col gap-3">
          {passwordError && (
            <div className="text-xs text-danger bg-danger-muted border border-danger rounded-lg px-3 py-2">
              {passwordError}
            </div>
          )}
          <div>
            <label className="block text-xs text-text-faint mb-1">Current Password</label>
            <div className="relative">
              <input type={showPassword.current ? "text" : "password"} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className={inputClass} />
              <button type="button" onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-body dark:hover:text-white transition-colors">
                {showPassword.current ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-faint mb-1">New Password</label>
              <div className="relative">
                <input type={showPassword.new ? "text" : "password"} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className={inputClass} />
                <button type="button" onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-body dark:hover:text-white transition-colors">
                  {showPassword.new ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-faint mb-1">Confirm Password</label>
              <div className="relative">
                <input type={showPassword.confirm ? "text" : "password"} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className={inputClass} />
                <button type="button" onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-body dark:hover:text-white transition-colors">
                  {showPassword.confirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={passwordSaving}
            className="self-start mt-1 px-5 py-2 bg-brand hover:bg-brand-soft disabled:bg-brand-soft disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm transition-all flex items-center gap-2 shadow-lg shadow-brand/25"
          >
            {passwordSaving ? <FiRefreshCw size={14} className="animate-spin" /> : <FiLock size={14} />}
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </SectionCard>
    </>
  );
}
