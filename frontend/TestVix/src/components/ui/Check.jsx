import React from 'react'
import { useState } from 'react';

export default function Check({set, item, theme, name, label1, label2, id1, id2, comment1, comment2}) {
  const [check, setCheck] = useState(item);
  const handleCheck = (i) =>{
    setCheck(i)
    set(i);
  }
  return (
    <div className='check'>
      <h3>{theme}</h3>
      <div className='check_div'>
          <label htmlFor={id1}>
            <input type="radio" checked={check === false} name={name} id={id1} onChange={()=>handleCheck(false)}/>
            {label1}
          </label>

          <label htmlFor={id2}>
            <input type="radio" checked={check === true} name={name} id={id2} onChange={()=>handleCheck(true)}/>
            {label2}
          </label>
      </div>
      <p>{check ? comment2 : comment1}</p>
    </div>
  )
}
