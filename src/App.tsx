import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import store, { persistor } from "./store/index.ts";
import { Toaster } from "react-hot-toast";
import Musics from "./pages/Musics";

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <div
          style={{
            background: "var(--yt-bg)",
            minHeight: "100vh",
            padding: 24,
          }}
        >
          <Toaster position="top-right" />
          <Musics />
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
