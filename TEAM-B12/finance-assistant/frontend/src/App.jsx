import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";

import Login        from "./pages/Login.jsx";
import Register     from "./pages/Register.jsx";
import Dashboard    from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets      from "./pages/Budgets.jsx";
import Reports      from "./pages/Reports.jsx";
import Profile      from "./pages/Profile.jsx";
import Portfolio    from "./pages/Portfolio.jsx";
import Alerts       from "./pages/Alerts.jsx";
import NotFound     from "./pages/NotFound.jsx";

function Protected({ children }) {
  return (
    <PrivateRoute>
      <AppLayout>{children}</AppLayout>
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/"             element={<Protected><Dashboard /></Protected>} />
      <Route path="/transactions" element={<Protected><Transactions /></Protected>} />
      <Route path="/budgets"      element={<Protected><Budgets /></Protected>} />
      <Route path="/portfolio"    element={<Protected><Portfolio /></Protected>} />
      <Route path="/alerts"       element={<Protected><Alerts /></Protected>} />
      <Route path="/reports"      element={<Protected><Reports /></Protected>} />
      <Route path="/profile"      element={<Protected><Profile /></Protected>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
