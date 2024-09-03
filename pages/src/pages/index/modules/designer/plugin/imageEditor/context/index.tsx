import React from 'react';

const MyContext = React.createContext({
    url: '',
    setUrl: (url: string) => {}
});

export default MyContext;
