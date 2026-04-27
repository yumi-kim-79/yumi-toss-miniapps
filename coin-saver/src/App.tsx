import { useEffect, useState } from "react";
import { Loader } from "@toss/tds-mobile";
import Home from "./screens/Home.tsx";
import { useTossUser } from "./hooks/useTossUser";
import { ensureUser } from "./lib/coinDb";
import "./App.css";

function App() {
  const { userId, loading: userLoading } = useTossUser();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    ensureUser(userId)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (userLoading || !userId || !ready) {
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

  return <Home userId={userId} />;
}

export default App;
