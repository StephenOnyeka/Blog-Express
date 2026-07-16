import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './database';
import env from './env';
import AuthService from '../services/auth.service';

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', session: false },
    async (email, password, done) => {
      try {
        const user = await AuthService.validateCredentials({ email, password });
        return done(null, user);
      } catch (error: any) {
        return done(null, false, { message: error.message });
      }
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_SECRET,
    },
    async (payload: { sub?: string; id?: string }, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub || payload.id },
        });
        return done(null, user || false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Google account has no email'), undefined);
          }
          const user = await AuthService.findOrCreateGoogleUser({
            googleId: profile.id,
            email,
            name: profile.displayName || email.split('@')[0],
            avatar: profile.photos?.[0]?.value,
          });
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
