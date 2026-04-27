import { useEffect, useState } from "react";
import { Loader } from "@toss/tds-mobile";
import { useTossUser } from "./hooks/useTossUser";
import { getUserWage } from "./lib/wageDb";
import Home from "./screens/Home.tsx";
import Onboarding from "./screens/Onboarding.tsx";
import type { WageUser } from "./types";

function App() {
  const { userId, loading: userLoading } = useTossUser();
  const [wage, setWage] = useState<WageUser | null>(null);
  const [wageLoaded, setWageLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setWageLoaded(false);
    getUserWage(userId)
      .then((w) => {
        if (cancelled) return;
        setWage(w);
        setWageLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setWageLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (userLoading || !userId || !wageLoaded) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader size="large" />
      </div>
    );
  }

  if (!wage) {
    return <Onboarding userId={userId} onComplete={(w) => setWage(w)} />;
  }

  return <Home userId={userId} wage={wage} />;
}

export default App;
