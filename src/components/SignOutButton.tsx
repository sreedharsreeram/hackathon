'use client'

import React from 'react'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'
import { signOutAction } from '@/server/auth/authActions'

type Props = {}

const SignOutButton = (props: Props) => {
  return (
    <button className='flex flex-row gap-3 w-full cursor-pointer' onClick={async() => {
        await signOutAction();
    }} >
                      <LogOut />
                      Log out
    </button>
  )
}

export default SignOutButton