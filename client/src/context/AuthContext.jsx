import { createContext, useEffect, useState } from "react";
import { useCallback } from "react";
import { baseURL, postRequest } from "../utils/service";

export const AuthContext = createContext()

export const AuthContextProvider = ({ children }) =>{
    const [user, setUser] = useState(null);
    const [registerError, setRegisterError] = useState(null);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [registerInfo, setRegisterInfo] = useState({
            username: "",
            email: "",
            password: "",
        });

    const [loginError, setLoginError] = useState(null);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [loginInfo, setLoginInfo] = useState({
            email: "",
            password: "",
        });

    console.log( "User", user);
    console.log("loginInfo", loginInfo);
    useEffect(() => {
        const user = localStorage.getItem("User");
        setUser(JSON.parse(user));
    }, []);


    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info);
    },[]);

        const updateLoginInfo = useCallback((info) => {
        setLoginInfo(info);
    },[]);

    const registerUser = useCallback(async (e) => {
        e.preventDefault();
        setIsRegisterLoading(true);
        setRegisterError(null);
        const response = await postRequest(
            `${baseURL}/users/register`,
            JSON.stringify(registerInfo)
        );

        setIsRegisterLoading(false);

        if (response.error) {
            return setRegisterError(response);
        }
        localStorage.setItem("User", JSON.stringify(response));
        localStorage.setItem("token", response.token);
        setUser(response);
    }, [registerInfo]);

    const loginUser = useCallback(async (e) => {
        e.preventDefault();
        setIsLoginLoading(true);
        setLoginError(null);
        const response = await postRequest(
            `${baseURL}/users/login`,
            JSON.stringify(loginInfo)
        );
        setIsLoginLoading(false);
        if (response.error) {
            return setLoginError(response);
        }
        
        localStorage.setItem("User", JSON.stringify(response));
        localStorage.setItem("token", response.token);
        setUser(response);
        
    }, [loginInfo]);
    
    const logoutUser = useCallback(() => {
        localStorage.removeItem("User");
        localStorage.removeItem("token");
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider 
            value={{
                user,
                registerInfo,
                updateRegisterInfo,
                registerUser,
                registerError,
                isRegisterLoading,
                logoutUser,
                loginInfo,
                updateLoginInfo,
                loginUser,
                loginError,
                isLoginLoading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}