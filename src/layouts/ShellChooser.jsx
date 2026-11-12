import { useSelector } from "react-redux";
import AppLayout from "./AppLayout";
import MarketingLayout from "./MarketingLayout";

export default function ShellChooser() {
  const authenticated = useSelector((state) => state.auth.status);
  return authenticated ? <AppLayout /> : <MarketingLayout />;
}
