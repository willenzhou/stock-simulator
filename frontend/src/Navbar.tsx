import firebase from 'firebase/app';
import React, { useEffect, useState } from 'react';
import Search from './Search';
import { Navbar, Nav, Button } from 'react-bootstrap'


const Navigation = () => {
    const [user, setUser] = useState<firebase.User | null>(null);
    const onAuthStateChange = () => {
        return firebase.auth().onAuthStateChanged((user) => {
            setUser(user);
        })
    }
    useEffect(() => onAuthStateChange(), [])
    return (
        <>
            <Navbar bg = 'primary' variant="dark">
                <Navbar.Brand href="/">Stock Explorer</Navbar.Brand>
                <Search />
                <Nav className="justify-content-end">
                    {!user && <Nav.Link href="/login">Login</Nav.Link>}
                    {user && <Nav.Link href="/profile">Profile</Nav.Link>}
                    {user && <Nav.Link href="/logout"><Button onClick={() => firebase.auth().signOut()}>Sign Out</Button></Nav.Link>}
                </Nav>
            </Navbar>
        </>
    )
}

export default Navigation;