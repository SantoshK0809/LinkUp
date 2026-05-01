import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WithAuth = (WrappedComponent) => {
    
  const AuthComponent = (props) => {
    const navigate = useNavigate();
    
    const isAuthenticated = () => {
        const token = localStorage.getItem("token")
        if(token){
            return true;
        }
        return false
    }

    useEffect(() => {
        if(!isAuthenticated()){
            navigate("/")
        }
    }, []);
    return <WrappedComponent {...props} />
  }

  return AuthComponent;
}   

export default WithAuth;