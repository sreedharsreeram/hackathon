'use client'

import { getNodes } from '@/server/actions'
import React, { useEffect } from 'react'

type Props = {
    params: {
        id: string
    }
}

const page = ({
    params
}: Props) => {
    const [data , setData] = React.useState<any>(null);
    const { id } = params;

    useEffect(() => {
        const fetchData = async () => {
            const res = await getNodes(Number(id));
            setData(res);
        }
        fetchData();

    
    }, [id])
  return (
    <div>{id}</div>
  )
}

export default page