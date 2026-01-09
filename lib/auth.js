import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1 week')
        .sign(key);
}

export async function decrypt(input) {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function login(userData) {
    // Create the session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    const session = await encrypt({ user: userData, expires });

    // Save the session in a cookie
    (await cookies()).set('session', session, { expires, httpOnly: true });
}

export async function logout() {
    // Destroy the session
    (await cookies()).set('session', '', { expires: new Date(0) });
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch (e) {
        return null;
    }
}
