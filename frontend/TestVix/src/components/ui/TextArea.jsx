import React from 'react'

export default function TextArea({place, label, setNom, nom}) {
  return (
    <div className='input_div'>
      <label htmlFor="">{label} </label>
      <textarea type="text" placeholder={place} value={nom} onChange={(e)=>setNom(e.target.value)}/>
    </div>
  )
}
