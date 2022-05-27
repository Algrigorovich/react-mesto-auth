import React from "react";
import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component: Component, ...props }) => {
  return (
    <Route>
      {
      () => props.loggedIn ? <Component {...props} /> : <Redirect to="/sign-in" />

      }
      {console.log(props.isLoggedIn, 'props')}
    </Route>
  )
}

export default ProtectedRoute;
