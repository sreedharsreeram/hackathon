'use server'

import { auth } from "@/server/auth"

export async function checkAuth() {
    const session = await auth()
    return !!session
} 