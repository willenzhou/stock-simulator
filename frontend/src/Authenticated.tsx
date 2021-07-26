import 'firebase/auth';
import firebase from "firebase/app";
import FirebaseAuth from 'react-firebaseui/FirebaseAuth';
import { Redirect } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebaseConfig from './firebaseConfig';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

type Props = {
    readonly children: React.ReactNode;
}


const Authenticated = ({ children }: Props) => {
    const [user, setUser] = useState<firebase.User | null>(null);

    const onAuthStateChange = () => {
        return firebase.auth().onAuthStateChanged((user) => {
            setUser(user);
            if (user) {
                // let uid = user?.getIdToken;
                // firebase.database().ref('users/' + uid).set({
                //     name: user.displayName
                // })
                fetch(`/createUser?name=${user.displayName as string}?userId=${user?.getIdToken}`, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                })
            }

        })
    }

    useEffect(() => onAuthStateChange(), [])

    const uiConfig = {
        signInFlow: 'popup',
        signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID, firebase.auth.GoogleAuthProvider.PROVIDER_ID]
    }

    return (
        <div>
            {user && <Redirect to="/profile" />}
            {!user && (
                <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
            )}
        </div>
    );
}



export { Authenticated };