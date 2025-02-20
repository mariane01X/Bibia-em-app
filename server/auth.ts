import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import crypto from 'crypto';

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
    console.log('Comparando senhas...');
    // Se a senha armazenada não tiver salt (caso do usuário mestre)
    if (!stored.includes('.')) {
      console.log('Senha sem salt detectada (usuário mestre)');
      return supplied === stored;
    }

    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    const result = timingSafeEqual(hashedBuf, suppliedBuf);
    console.log('Resultado da comparação:', result);
    return result;
  } catch (error) {
    console.error("Erro ao comparar senhas:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  console.log('Iniciando configuração de autenticação...');

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

  console.log('Middleware de sessão configurado');

  app.use(passport.initialize());
  app.use(passport.session());

  console.log('Passport inicializado');

  passport.use(new LocalStrategy(
    {
      usernameField: 'nomeUsuario',
      passwordField: 'senha'
    },
    async (nomeUsuario: string, senha: string, done: any) => {
      try {
        console.log(`Iniciando processo de login para: ${nomeUsuario}`);

        // Verifica se é o usuário mestre
        if (nomeUsuario === MASTER_USER.nomeUsuario) {
          console.log("Tentativa de login como usuário mestre");
          console.log("Senha fornecida:", senha);
          console.log("Senha esperada:", MASTER_USER.senha);

          if (senha === MASTER_USER.senha) {
            console.log("Senha do usuário mestre correta");
            let masterUser = await storage.getUser(MASTER_USER.id);

            if (!masterUser) {
              console.log("Criando usuário mestre pela primeira vez");
              masterUser = await storage.createUser({
                ...MASTER_USER,
                id: MASTER_USER.id,
                senha: MASTER_USER.senha
              });
              console.log("Usuário mestre criado:", masterUser);
            }

            console.log("Login do usuário mestre bem-sucedido");
            return done(null, masterUser);
          }

          console.log("Senha incorreta para usuário mestre");
          return done(null, false, { message: "Senha incorreta" });
        }

        // Login para usuários normais
        console.log("Buscando usuário no banco:", nomeUsuario);
        const user = await storage.getUserByUsername(nomeUsuario);

        if (!user) {
          console.log("Usuário não encontrado:", nomeUsuario);
          return done(null, false, { message: "Usuário não encontrado" });
        }

        console.log("Usuário encontrado, verificando senha");
        const isValid = await comparePasswords(senha, user.senha);
        if (!isValid) {
          console.log("Senha incorreta para usuário:", nomeUsuario);
          return done(null, false, { message: "Senha incorreta" });
        }

        console.log("Login bem-sucedido para:", nomeUsuario);
        return done(null, user);
      } catch (err) {
        console.error("Erro durante autenticação:", err);
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    console.log("Serializando usuário:", user.nomeUsuario);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log("Desserializando usuário ID:", id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log("Usuário não encontrado na desserialização:", id);
        return done(null, false);
      }
      console.log("Usuário desserializado com sucesso:", user.nomeUsuario);
      done(null, user);
    } catch (err) {
      console.error("Erro ao desserializar usuário:", err);
      done(err);
    }
  });

  // Rota de registro de novos usuários
  app.post("/api/register", async (req, res) => {
    try {
      console.log("Tentativa de registro de novo usuário:", req.body.nomeUsuario);

      const existingUser = await storage.getUserByUsername(req.body.nomeUsuario);
      if (existingUser) {
        console.log("Nome de usuário já existe:", req.body.nomeUsuario);
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      const hashedPassword = await hashPassword(req.body.senha);
      console.log("Senha hasheada com sucesso");

      const newUser = await storage.createUser({
        ...req.body,
        id: crypto.randomUUID(),
        senha: hashedPassword
      });

      console.log("Novo usuário criado com sucesso:", newUser.nomeUsuario);

      req.login(newUser, (err) => {
        if (err) {
          console.error("Erro ao fazer login após registro:", err);
          return res.status(500).json({ message: "Erro ao completar registro" });
        }
        res.status(201).json(newUser);
      });
    } catch (error) {
      console.error("Erro ao registrar novo usuário:", error);
      res.status(500).json({ message: "Erro ao registrar usuário" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Requisição de login recebida:", { nomeUsuario: req.body.nomeUsuario });
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("Erro durante autenticação:", err);
        return next(err);
      }
      if (!user) {
        console.log("Falha na autenticação:", info?.message);
        return res.status(401).json({ message: info?.message || "Falha na autenticação" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Erro ao estabelecer sessão:", err);
          return next(err);
        }
        console.log("Login bem-sucedido para:", user.nomeUsuario);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const username = req.user?.nomeUsuario;
    console.log("Requisição de logout recebida para usuário:", username);
    req.logout((err) => {
      if (err) {
        console.error("Erro durante logout:", err);
        return next(err);
      }
      console.log("Logout bem-sucedido para usuário:", username);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Tentativa não autenticada de acessar dados do usuário");
      return res.sendStatus(401);
    }
    console.log("Dados do usuário retornados para:", req.user.nomeUsuario);
    res.json(req.user);
  });

  app.patch("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Tentativa não autenticada de atualizar dados do usuário");
      return res.sendStatus(401);
    }

    try {
      console.log(`Atualizando dados para usuário: ${req.user.nomeUsuario}`, req.body);
      const { idadeConversao, dataBatismo, useTTS, editCounter } = req.body;
      const updatedUser = await storage.updateUser(req.user.id, {
        idadeConversao,
        dataBatismo,
        useTTS: typeof useTTS === 'boolean' ? useTTS : undefined,
        editCounter: typeof editCounter === 'number' ? editCounter : undefined
      });
      console.log(`Dados atualizados com sucesso para: ${updatedUser.nomeUsuario}`);
      res.json(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
      res.status(500).json({ message: "Erro ao atualizar dados do usuário" });
    }
  });

  console.log('Configuração de autenticação concluída');
}