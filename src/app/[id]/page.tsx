import React from 'react'

type Props = {
    params: {
        id: string
    }
}

const page = ({
    params
}: Props) => {
    const { id } = params;
  return (
    <div>{id}</div>
  )
}

export default page