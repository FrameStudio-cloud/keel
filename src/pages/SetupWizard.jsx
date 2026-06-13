import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SetupWizard() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
}
