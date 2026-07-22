import { createContext, useContext, useReducer, useState } from "react";


const SearchConText = createContext();




export function SearchProvider({ children }) {


    const [searchText, setSearchText] = useState({ 'text': '', 'submit': 0 })


    return (

        <SearchConText.Provider
            value={{
                searchText,
                setSearchText
            }}
        >

            {children}

        </SearchConText.Provider>

    );

}



export function useSearchCon() {

    return useContext(SearchConText);

}