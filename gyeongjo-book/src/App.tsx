import { useState } from "react";
import { Loader } from "@toss/tds-mobile";
import AddRecord from "./screens/AddRecord.tsx";
import Home from "./screens/Home.tsx";
import PersonDetail from "./screens/PersonDetail.tsx";
import { useTossUser } from "./hooks/useTossUser";

type Screen =
  | { name: "home" }
  | { name: "add"; prefilledName?: string }
  | { name: "detail"; personName: string };

function App() {
  const { userId, loading: userLoading } = useTossUser();
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [refreshKey, setRefreshKey] = useState(0);

  if (userLoading || !userId) {
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

  const goHome = (refresh: boolean) => {
    if (refresh) setRefreshKey((k) => k + 1);
    setScreen({ name: "home" });
  };

  if (screen.name === "add") {
    return (
      <AddRecord
        userId={userId}
        prefilledName={screen.prefilledName}
        onCancel={() => goHome(false)}
        onComplete={() => goHome(true)}
      />
    );
  }

  if (screen.name === "detail") {
    return (
      <PersonDetail
        key={`${screen.personName}-${refreshKey}`}
        userId={userId}
        personName={screen.personName}
        onBack={() => goHome(false)}
        onAddRecord={(prefilledName) =>
          setScreen({ name: "add", prefilledName })
        }
      />
    );
  }

  return (
    <Home
      key={refreshKey}
      userId={userId}
      onAdd={() => setScreen({ name: "add" })}
      onDetail={(personName) => setScreen({ name: "detail", personName })}
    />
  );
}

export default App;
