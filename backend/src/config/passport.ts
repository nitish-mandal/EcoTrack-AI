import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';
import { prisma } from './database';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'ecotrack_local_dev_secret_key_9923';

const generateToken = (id: string, role: string): string =>
  jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '30d' });

// ── Google Strategy ──────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const avatar = profile.photos?.[0]?.value;
        const name = profile.displayName || 'EcoTrack User';

        if (!email) return done(new Error('No email from Google'), undefined);

        // Find by googleId first, then by email
        let user = await prisma.user.findFirst({ where: { googleId: profile.id } });

        if (!user && email) {
          user = await prisma.user.findUnique({ where: { email } });
        }

        if (user) {
          // Update googleId / avatar if missing
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: user.googleId || profile.id,
              avatar: user.avatar || avatar || '',
              isVerified: true,
              lastActive: new Date(),
            },
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              name,
              email: email!,
              googleId: profile.id,
              avatar: avatar || '',
              isVerified: true,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

// ── GitHub Strategy ──────────────────────────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: `${BACKEND_URL}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        const email = (
          profile.emails?.find((e: any) => e.primary)?.value ||
          profile.emails?.[0]?.value ||
          ''
        ).toLowerCase();
        const avatar = profile.photos?.[0]?.value;
        const name = profile.displayName || profile.username || 'EcoTrack User';

        // Find by githubId first, then email
        let user = await prisma.user.findFirst({ where: { githubId: profile.id?.toString() } });

        if (!user && email) {
          user = await prisma.user.findUnique({ where: { email } });
        }

        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              githubId: user.githubId || profile.id?.toString(),
              avatar: user.avatar || avatar || '',
              isVerified: true,
              lastActive: new Date(),
            },
          });
        } else {
          user = await prisma.user.create({
            data: {
              name,
              email: email || `github_${profile.id}@ecotrack.app`,
              githubId: profile.id?.toString(),
              avatar: avatar || '',
              isVerified: true,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

// ── Serialization (not used with JWT, but required by passport) ───────────────
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ── Helper used in route callbacks ────────────────────────────────────────────
export const buildOAuthRedirect = (user: any): string => {
  const token = generateToken(user.id, user.role);
  const safeUser = JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    ecoPoints: user.ecoPoints,
  });
  return `${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(safeUser)}`;
};

export default passport;
