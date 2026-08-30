import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "@/app/store/store";
import App from "./App";
import "./index.css";
import AuthInitializer from "@/features/auth/components/AuthInitializer";


const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <App />
      </AuthInitializer>
    </QueryClientProvider>
  </Provider>
</StrictMode>,

  
);