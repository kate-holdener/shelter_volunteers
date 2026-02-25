import { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { loginAPI } from '../../api/login';
import { categorizeError } from '../../api/fetchClient';
import "../../styles/Login.css";
import { jwtDecode } from "jwt-decode";
import {useAuth } from "../../contexts/AuthContext";
import ServerError from "../ServerError";

function Login() {
  const { login } = useAuth();
  const [loginError, setLoginError] = useState(false);
  const onSuccess = (credentialResponse) => {
    setLoginError(false);
    const decoded = jwtDecode(credentialResponse.credential);
    const user = {
      name: decoded.name || decoded.given_name || decoded.email,
      email: decoded.email,
      picture: decoded.picture || decoded.profile_picture || "",
    }
    loginAPI.login(credentialResponse.credential)
      .then(response => {
        login(response.access_token, user);
      })
      .catch(error => {
        console.error('API Error:', error);
        setLoginError(categorizeError(error, 'Login failed. Please try again.'));
      });
  };
    
    const onError = () => {
      console.log('Login Failed');
    };

    if (loginError === true) return <ServerError />;
  
    return (
      <div className="home-container">
        <div className="content-wrapper">
          <h2 className="title">
            Welcome to <span className="app-name">Volunteer Connect</span>
          </h2>
          <p className="tagline">
            Connecting volunteers with emergency shelters to make a difference!
          </p>
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={onSuccess}
              onError={onError}
              theme="filled_blue"
              type="standard"
              shape="rectangular"
              size="large"
            />
          </div>
          {typeof loginError === 'string' && (
            <p className="message error">{loginError}</p>
          )}
          <p className="tagline-small">
            Sign in to get started with your personalized experience
          </p>
        </div>
      </div>        
    );
}
export default Login;