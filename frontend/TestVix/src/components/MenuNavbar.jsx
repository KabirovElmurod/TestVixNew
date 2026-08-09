import React, { useEffect, useState } from 'react'
import Hamburger from './ui/Hamburger'
import Logo from './ui/Logo'
import ThemeButton from './ui/ThemeButton'
import ProfileTheme from './ui/ProfileTheme'
import { getSearchTest, profile_img } from '../api/request_testlar'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useSearchCon } from '../context/SearchContext'
import { useNavigate } from 'react-router-dom'
export default function MenuNavbar({ profile, themeIcon, themeLabel, toggleTheme, closeMobileMenu, setMobileMenuOpen, mobileMenuOpen }) {
  const navigate = useNavigate()
  let { pathname } = useLocation()
  let path = pathname.split('/')[1]
  let search_query = pathname.split('/')[2]

  const { searchText, setSearchText, searchTest, setSearchTest } = useSearchCon()
  const [search, setSearch] = useState('')

  const [openSmallSearch, setSmallSearch] = useState(false)

  const handleOpenSmallSearchInput = () => {
    let win = window.innerWidth;
    if (win > 600) {
      document.getElementById('bi_search_main').type = 'submit'

      return
    }
    document.getElementById('bi_search_main').type = 'button'
    setSmallSearch(true)
  }

  const handleSearchSubmit = async (value, e) => {
    if (e) e.preventDefault()
    console.log('search=>', value, searchText);

    let data = {}
    if (!value || value === '') {
      return
    }
    if (typeof value === "number") {
      data['text'] = value;
      data['type'] = "number";
    } else if (typeof value === "string" && value.length === 20 && !value.includes(' ')) {
      data['text'] = value;
      data['type'] = "key";
    } else if (typeof value === "string") {
      data['text'] = value;
      data['type'] = "string";
    }
    // console.log('data=>', data);

    let res = await getSearchTest(data)
    console.log(res);
    setSearchTest(res)
    navigate(`/search/${value}`)

  }
  useEffect(
    () => {
      setSearch(searchText.text)
      if (searchText.submit === 1) {
        handleSearchSubmit(searchText.text)
      }
    }, [searchText]
  )

  useEffect(() => {
    if (path == 'search' && search_query) {
      setSearch(search_query)
      setSearchText({ 'text': search_query, 'submit': 0 })
      handleSearchSubmit(search_query)
    }
  }, [])


  const handleSearchChange = (value) => {
    setSearch(value)
    setSearchText({ 'text': value, 'submit': 0 })
    // console.log(value);
    console.log("value=>", searchText);


  }


  return (
    <div className='menu-cont-div'>
      {
        openSmallSearch ? (
          <form className='input-div' onSubmit={(e) => handleSearchSubmit(search, e)}>
            <button className='exit-search-input-btn' type='button' onClick={() => setSmallSearch(false)}>
              <i className='bi bi-arrow-left-short'></i>
            </button>
            <input type="text" placeholder="Qidirish" className="search-input" value={search} onChange={(e) => handleSearchChange(e.target.value)}
            // value={search} onChange={(e) => setSearch(e.target.value)} />
            />
            <button className="bi bi-search"></button>
          </form>

        )
          :
          (
            <div className='menu-navbar'>
              <div>
                <Hamburger setMobileMenuOpen={setMobileMenuOpen} mobileMenuOpen={mobileMenuOpen}></Hamburger>
                <Logo closeMobileMenu={closeMobileMenu} />
              </div>
              <form className='input-div' onSubmit={(e) => handleSearchSubmit(search, e)}>
                <input type="text" placeholder="Qidirish" className="search-input" value={search} onChange={(e) => handleSearchChange(e.target.value)}
                // value={search} onChange={(e) => setSearch(e.target.value)} />
                />
                <button className="bi bi-search" id='bi_search_main' onClick={handleOpenSmallSearchInput}></button>
              </form>
              <div>
                <ThemeButton closeMobileMenu={closeMobileMenu} themeIcon={themeIcon} toggleTheme={toggleTheme} themeLabel={''}></ThemeButton>
                <Link to={'/profile'}>
                  <img src={profile} alt="" />
                </Link>
              </div>
            </div>
          )
      }
    </div>
  )
}
