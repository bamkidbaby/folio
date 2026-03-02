import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import passport from "passport";
import session from "express-session";
import pg from 'pg';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from "bcrypt";
import { fileURLToPath } from 'url';
import path from 'path';


const app = express();
const port = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const db = new pg.Pool({
//   user: process.env.PG_USER,
//   password: process.env.PG_PASSWORD,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DB,
//   port: process.env.PG_PORT,
// });

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "Public")));
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//   }),
// );
// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser((user, done) => done(null, user.id));

// passport.deserializeUser(async (id, done) => {
//   try {
//     const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
//     done(null, rows[0] || false);
//   } catch (err) {
//     done(err);
//   }
// });

// // ─── Local Strategy ────────────────────────────────────
// passport.use(new LocalStrategy(
//   { usernameField: 'email', passwordField: 'password' },
//   async (email, password, done) => {
//     try {
//       const { rows } = await db.query(
//         'SELECT * FROM users WHERE email = $1',
//         [email.toLowerCase().trim()]
//       );
//       const user = rows[0];

//       if (!user) return done(null, false, { message: 'No account found with that email.' });
//       if (!user.password) return done(null, false, { message: 'This account uses Google Sign-In. Please sign in with Google.' });

//       const match = await bcrypt.compare(password, user.password);
//       if (!match) return done(null, false, { message: 'Incorrect password.' });

//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   }
// ));

// // ─── Google OAuth2 Strategy ────────────────────────────
// passport.use(new GoogleStrategy(
//   {
//     clientID:     process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL:  '/auth/google/callback',
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       const email      = profile.emails?.[0]?.value?.toLowerCase();
//       const googleId   = profile.id;
//       const name       = profile.displayName;
//       const avatarUrl  = profile.photos?.[0]?.value;

//       // 1. Find existing user by google_id
//       let { rows } = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
//       if (rows[0]) return done(null, rows[0]);

//       // 2. Find existing user by email — link accounts
//       if (email) {
//         const byEmail = await db.query('SELECT * FROM users WHERE email = $1', [email]);
//         if (byEmail.rows[0]) {
//           const updated = await db.query(
//             'UPDATE users SET google_id = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
//             [googleId, avatarUrl, byEmail.rows[0].id]
//           );
//           return done(null, updated.rows[0]);
//         }
//       }

//       // 3. Create new user
//       const insert = await db.query(
//         'INSERT INTO users (name, email, google_id, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
//         [name, email || null, googleId, avatarUrl || null]
//       );
//       return done(null, insert.rows[0]);
//     } catch (err) {
//       return done(err);
//     }
//   }
// ));
app.get("/", (req, res) => res.render("index"));

app.listen(port, () => console.log(`Server is running on port ${port}`));
