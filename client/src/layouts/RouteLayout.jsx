import { NavLink, Outlet } from "react-router-dom";

const RouteLayout = () => {

    return (
        <div>
            <header>
                <nav>
                    <NavLink to="/"> Home </NavLink>
                    <NavLink to="/login"> Login </NavLink>
                    <NavLink to="/signup"> Sign Up </NavLink>
                    <NavLink to="/buy"> Buy </NavLink>
                </nav>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    )

}

export default RouteLayout;