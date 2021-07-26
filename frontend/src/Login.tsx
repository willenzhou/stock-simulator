import React from 'react';
import {Authenticated} from './Authenticated';

const Login = () => {
    return(
        <div>
            <h1 className="display-6">Login</h1>
            <div>
                Login to your Stock Explorer account:
            </div>
            <Authenticated>
            </Authenticated>
        </div>
        
    )
}

export default Login;