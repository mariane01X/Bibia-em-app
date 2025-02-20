import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

const MASTER_USER = {
  id: "master-user",
  nomeUsuario: "Felipe Benchimol",
  senha: "130903",
  idadeConversao: "15",
  dataBatismo: "2018",
  isAdmin: true,
  profileType: "master",
  editCounter: 0,
  useTTS: false,
  lastLogin: new Date()
};

async function hashPassword(senha: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(senha, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    return false;
  }
}

export function setupAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    {
      usernameField: 'nomeUsuario',
      passwordField: 'senha'
    },
    async (nomeUsuario: string, senha: string, done: any) => {
      try {
        if (nomeUsuario === MASTER_USER.nomeUsuario) {
          let masterUser = await storage.getUser(MASTER_USER.id);

          if (!masterUser) {
            const hashedPassword = await hashPassword(MASTER_USER.senha);
            masterUser = await storage.createUser({
              ...MASTER_USER,
              senha: hashedPassword
            });
          }

          if (senha === MASTER_USER.senha) {
            return done(null, masterUser);
          }

          return done(null, false, { message: "Senha incorreta" });
        }

        const user = await storage.getUserByUsername(nomeUsuario);
        if (!user) {
          return done(null, false, { message: "Usuário não encontrado" });
        }

        const isValid = await comparePasswords(senha, user.senha);
        if (!isValid) {
          return done(null, false, { message: "Senha incorreta" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Falha na autenticação" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    res.json(req.user);
  });

  app.patch("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { idadeConversao, dataBatismo, useTTS, editCounter } = req.body;
      const updatedUser = await storage.updateUser(req.user.id, {
        idadeConversao,
        dataBatismo,
        useTTS: typeof useTTS === 'boolean' ? useTTS : undefined,
        editCounter: typeof editCounter === 'number' ? editCounter : undefined
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar dados do usuário" });
    }
  });
}