import { Container, Nav, Navbar, Stack } from "react-bootstrap";
import {Link} from 'react-router-dom'
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
const NavBar = () => {

    const {user, logoutUser} = useContext(AuthContext);

    return <Navbar bg="dark" className="mb-4" style={{ height: "3.75rem" }} >
        <Container>
            <h2>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                    MiniChatApp
                </Link>
            </h2>
            {user && <span className="text-warning">
                Logged in as {user ?.username }
            </span>}
            <Nav>
                <Stack direction="horizontal" gap={3}>
                    {user && (
                        <>
                            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
                                <i className="fas fa-home"></i> Home
                            </Link>
                            <Link to="/chat" style={{ color: 'white', textDecoration: 'none' }}>
                                <i className="fas fa-comments"></i> Chat
                            </Link>
                            <Link to="/feed" style={{ color: 'white', textDecoration: 'none' }}>
                                <i className="fas fa-newspaper"></i> Feed
                            </Link>
                            <Link to="/friends" style={{ color: 'white', textDecoration: 'none' }}>
                                <i className="fas fa-user-friends"></i> Friends
                            </Link>
                            <Link to="/notifications" style={{ color: 'white', textDecoration: 'none' }}>
                                <i className="fas fa-bell"></i> Notifications
                            </Link>
                            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }} onClick={() => logoutUser()}>
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </Link>
                        </>
                    )}
                    {!user && (
                        <>
                            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                                <i className="fas fa-sign-in-alt"></i> Login
                            </Link>
                            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
                                <i className="fas fa-user-plus"></i> Register
                            </Link>
                        </>
                    )}
                </Stack>
            </Nav>
        </Container>
    </Navbar>;
}
 
export default NavBar;