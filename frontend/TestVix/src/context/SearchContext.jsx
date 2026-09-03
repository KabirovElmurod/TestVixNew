import { createContext, useContext, useReducer, useState } from "react";


const SearchConText = createContext();




export function SearchProvider({ children }) {



    const [searchText, setSearchText] = useState({ 'text': '', 'submit': 0 })
    const [searchTest, setSearchTest] = useState()
    const [test_cate, setTestCate] = useState()


    return (

        <SearchConText.Provider
            value={{
                searchText,
                setSearchText,
                searchTest,
                setSearchTest,
                test_cate,
                setTestCate
            }}
        >

            {children}

        </SearchConText.Provider>

    );

}



export function useSearchCon() {

    return useContext(SearchConText);

}