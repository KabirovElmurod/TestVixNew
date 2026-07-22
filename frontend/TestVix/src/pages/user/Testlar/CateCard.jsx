import React, { useState, useCallback } from 'react'
import { test_data } from './data'
import TestCard from '../../../components/ui/TestCard'

export default function ({ handleCopyId, steps_class, setSearch }) {
    const [testlar, setTestlar] = useState(test_data)


    return (

        <div className={steps_class}>

            {testlar?.map((test) => (
                <TestCard test={test} key={test.test_id} handleCopyId={handleCopyId}></TestCard>
            ))}
        </div>


    )
}
