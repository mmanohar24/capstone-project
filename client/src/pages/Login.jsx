function Login() {
    return (
        <div>
            <form>
                <label htmlFor="first-name"> Enter First Name </label>
                <input id="first-name" type="text" />

                <label htmlFor="last-name"> Enter Last Name </label>
                <input id="last-name" type="text" />

                <label htmlFor="email"> Enter Email </label>
                <input id="Email" type="text" />

                <label htmlFor="phone"> Enter Phone Number </label>
                <input id="phone" type="number" />
            </form>
        </div>
    )
}

export default Login;