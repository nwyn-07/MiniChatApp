import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <Container className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome back, {user?.username}!</h1>
                <p>Choose what you want to do today</p>
            </div>

            <Row className="dashboard-grid">
                <Col md={6} lg={4} className="mb-4">
                    <Card className="dashboard-card">
                        <Card.Body className="text-center">
                            <div className="card-icon">
                                <i className="fas fa-comments"></i>
                            </div>
                            <Card.Title>Chat</Card.Title>
                            <Card.Text>
                                Start conversations with your friends and colleagues
                            </Card.Text>
                            <Link to="/chat">
                                <Button variant="primary" className="card-button">
                                    Open Chat
                                </Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={4} className="mb-4">
                    <Card className="dashboard-card">
                        <Card.Body className="text-center">
                            <div className="card-icon">
                                <i className="fas fa-newspaper"></i>
                            </div>
                            <Card.Title>Feed</Card.Title>
                            <Card.Text>
                                Share your thoughts and see what others are posting
                            </Card.Text>
                            <Link to="/feed">
                                <Button variant="success" className="card-button">
                                    View Feed
                                </Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={4} className="mb-4">
                    <Card className="dashboard-card">
                        <Card.Body className="text-center">
                            <div className="card-icon">
                                <i className="fas fa-user-friends"></i>
                            </div>
                            <Card.Title>Friends</Card.Title>
                            <Card.Text>
                                Manage your friend requests and connections
                            </Card.Text>
                            <Link to="/friends">
                                <Button variant="info" className="card-button">
                                    Manage Friends
                                </Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={4} className="mb-4">
                    <Card className="dashboard-card">
                        <Card.Body className="text-center">
                            <div className="card-icon">
                                <i className="fas fa-bell"></i>
                            </div>
                            <Card.Title>Notifications</Card.Title>
                            <Card.Text>
                                Check your latest notifications and updates
                            </Card.Text>
                            <Link to="/notifications">
                                <Button variant="warning" className="card-button">
                                    View Notifications
                                </Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
