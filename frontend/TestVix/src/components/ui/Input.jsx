import React from 'react';
export default function Input({place, label, setNom, nom, disabled}) {
  return (
    <div className='input_div'>
      <label htmlFor="">{label} </label>
      {
        disabled || disabled === undefined?
        <input type="text" placeholder={place} value={nom} onChange={(e)=>setNom(e.target.value)}/>
        : 
        <input className='input_dis' type="text" placeholder={place} value={nom} onChange={(e)=>setNom(e.target.value)} disabled/>
      }
    </div>
  )
}
