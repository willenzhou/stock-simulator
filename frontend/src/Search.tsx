import React, { useState } from 'react';
import  { useHistory } from 'react-router'
import { Link } from 'react-router-dom';
import {Button, Form, FormControl} from 'react-bootstrap'



const Search = () => {
    const [query, changeQuery] = useState("");
    const history = useHistory();

    return(
        <span>
            <Form inline onSubmit={() => history.push(`/stock/${query}`)}>
            <FormControl 
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            />
            <Button variant="secondary" type="submit">Go</Button>
            </Form>
        </span>
        
    )
}

export default Search;