import { useState } from "react";
import { Loader } from "@toss/tds-mobile";
import AddCard from "./screens/AddCard.tsx";
import CardDetail from "./screens/CardDetail.tsx";
import Funeral from "./screens/Funeral.tsx";
import Home from "./screens/Home.tsx";
import Memorial from "./screens/Memorial.tsx";
import { useTossUser } from "./hooks/useTossUser";
import type { Card } from "./types";

type Screen = "home" | "add" | "detail" | "funeral" | "memorial";

function App() {
  const { userId, loading: userLoading } = useTossUser();
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
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
    setSelectedCard(null);
    setScreen("home");
  };

  if (screen === "add") {
    return (
      <AddCard
        userId={userId}
        onCancel={() => goHome(false)}
        onComplete={() => goHome(true)}
      />
    );
  }
  if (screen === "memorial") {
    return <Memorial userId={userId} onBack={() => goHome(false)} />;
  }
  if (screen === "detail" && selectedCard) {
    return (
      <CardDetail
        card={selectedCard}
        onBack={() => goHome(false)}
        onUpdate={() => goHome(true)}
        onFuneral={() => setScreen("funeral")}
      />
    );
  }
  if (screen === "funeral" && selectedCard) {
    return <Funeral card={selectedCard} onComplete={() => goHome(true)} />;
  }

  return (
    <Home
      key={refreshKey}
      userId={userId}
      onAdd={() => setScreen("add")}
      onDetail={(card) => {
        setSelectedCard(card);
        setScreen("detail");
      }}
      onMemorial={() => setScreen("memorial")}
    />
  );
}

export default App;
