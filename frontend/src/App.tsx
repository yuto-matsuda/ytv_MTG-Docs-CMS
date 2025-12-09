import { BrowserRouter } from "react-router"
import AppRoutes from "./routes/AppRoutes"

export default function App() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  )
}