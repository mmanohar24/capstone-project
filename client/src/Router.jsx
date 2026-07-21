import { createBrowserRouter, Route, createRoutesFromElements, RouterProvider } from "react-router-dom";


// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Buy from "./pages/Buy";
import Dashboard from "./pages/Dashboard";
import CarDetail from "./pages/CarDetail";
import LogSymptom from "./pages/LogSymptom";

// Layouts
import RouteLayout from "./layouts/RouteLayout";


const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<RouteLayout />}>

            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route path="/cars/:id/log" element={<LogSymptom />} />

        </Route>
    )
)

function Router() {
    return (
        <RouterProvider router={router} />
    )
}

export default Router;