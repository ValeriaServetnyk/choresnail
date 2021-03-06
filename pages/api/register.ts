import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { createCSRFSecret } from '../../util/auth';
import { createSerializedRegisterSessionTokenCookie } from '../../util/cookies';
import {
  createSession,
  createUser,
  getUserByUsername,
} from '../../util/database';

// api route to store user registration info. Backend for signup page

export type RegisterResponseBody =
  | {
      errors: {
        message: string;
      }[];
    }
  | { user: { id: number; username: string } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponseBody>,
) {
  // method must be post
  if (req.method === 'POST') {
    if (
      typeof req.body.username !== 'string' ||
      typeof req.body.password !== 'string' ||
      !req.body.username ||
      !req.body.password
    ) {
      res
        .status(401)
        .json({ errors: [{ message: 'username or password not provided' }] });
      return;
    }

    if (await getUserByUsername(req.body.username)) {
      res.status(401).json({ errors: [{ message: 'username already taken' }] });
      return;
    }
    // hash password
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    // create new user
    const newUser = await createUser(req.body.username, passwordHash);

    const token = crypto.randomBytes(80).toString('base64');

    // 1. create a secret
    const csrfSecret = createCSRFSecret();

    const session = await createSession(token, newUser.id, csrfSecret);

    const serializedCookie = await createSerializedRegisterSessionTokenCookie(
      session.token,
    );

    res
      .status(200)
      .setHeader('set-Cookie', serializedCookie)
      .json({ user: { id: newUser.id, username: newUser.username } });
  } else {
    res.status(405).json({ errors: [{ message: 'method not allowed' }] });
  }
}
