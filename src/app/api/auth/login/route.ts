import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { setSessionCookie } from '@/utils/session';
import { limiter } from '../../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../../_middleware/handleZodError';
import { sendVerifyEmail } from '@/utils/email';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8).max(100),
      captcha: z.string().optional(),
    });
    const { email, password, captcha } = schema.parse(await req.json());
    // If captcha is present (shown after 3 failed attempts), verify it
    if (captcha) {
      const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY;
      const verifyRes = await fetch(
        "https://hcaptcha.com/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${hcaptchaSecret}&response=${captcha}`,
        }
      );
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json({ error: "CAPTCHA failed." }, { status: 400, headers });
      }
    }
    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers });
    }
    if (!user.isVerified) {
      return NextResponse.json({ 
        error: 'Your email address is not verified. Please verify your account to continue.',
        canResendVerification: true
      }, { status: 403, headers });
    }
    const res = NextResponse.json(
      { id: user.id, email: user.email, name: user.name, roleId: user.roleId, isAdmin: user.isAdmin, isLineManager: user.isLineManager },
      { headers }
    );
    // Clear any existing session cookie before setting a new one
    res.cookies.set({ name: 'okr_session', value: '', maxAge: 0, path: '/' });
    await setSessionCookie(res, {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name || '',
      isAdmin: user.isAdmin,
      isLineManager: user.isLineManager,
    });
    return res;
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
