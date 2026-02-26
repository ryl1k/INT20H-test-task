import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { SignInPage } from "@/pages/SignInPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { ImportPage } from "@/pages/ImportPage";
// import { CreateOrderPage } from "@/pages/CreateOrderPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ROUTES } from "./routes";

export const router = createBrowserRouter([
  { path: ROUTES.SIGN_IN, element: <SignInPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.ORDERS, element: <OrdersPage /> },
          { path: ROUTES.IMPORT, element: <ImportPage /> },
          // { path: ROUTES.CREATE, element: <CreateOrderPage /> },
          { path: "*", element: <NotFoundPage /> }
        ]
      }
    ]
  }
]);
