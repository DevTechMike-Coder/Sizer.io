import fs from "fs";
import path from "path";

export interface DBUser {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  riskProfile?: DBRiskProfile | null;
}

export interface DBRiskProfile {
  id: string;
  userId: string;
  defaultEquity: number;
  defaultRiskPercent: number;
  defaultLeverage: number;
  propFirmMode: boolean;
  maxDailyLossPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBTradeSetup {
  id: string;
  userId?: string | null;
  symbol: string;
  assetName: string;
  category: string;
  direction: string;
  accountEquity: number;
  riskPercent: number;
  riskDollar: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  recommendedSize: number;
  unitLabel: string;
  lotMultiplier?: number | null;
  riskRewardRatio: number;
  potentialProfit: number;
  pipsAtRisk?: number | null;
  pipsTarget?: number | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: DBUser[];
  risk_profiles: DBRiskProfile[];
  trade_setups: DBTradeSetup[];
}

const DB_DIR = path.join(process.cwd(), "prisma");
const DB_FILE = path.join(DB_DIR, "dev_db.json");

function ensureDB(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      users: [],
      risk_profiles: [],
      trade_setups: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }

  try {
    const content = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(content);
  } catch {
    return { users: [], risk_profiles: [], trade_setups: [] };
  }
}

function saveDB(data: DatabaseSchema) {
  ensureDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

function generateId(): string {
  return "c" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export const db = {
  user: {
    async findUnique(args: { where: { email?: string; id?: string }; include?: { riskProfile?: boolean } }) {
      const data = ensureDB();
      const user = data.users.find(
        (u) =>
          (args.where.email && u.email.toLowerCase() === args.where.email.toLowerCase()) ||
          (args.where.id && u.id === args.where.id)
      );
      if (!user) return null;

      if (args.include?.riskProfile) {
        const profile = data.risk_profiles.find((p) => p.userId === user.id);
        return { ...user, riskProfile: profile || null };
      }
      return user;
    },

    async create(args: {
      data: {
        email: string;
        name?: string | null;
        passwordHash: string;
        riskProfile?: {
          create?: {
            defaultEquity?: number;
            defaultRiskPercent?: number;
            defaultLeverage?: number;
            propFirmMode?: boolean;
            maxDailyLossPercent?: number;
          };
        };
      };
      include?: { riskProfile?: boolean };
    }) {
      const data = ensureDB();
      const userId = generateId();
      const now = new Date().toISOString();

      const newUser: DBUser = {
        id: userId,
        email: args.data.email.toLowerCase().trim(),
        name: args.data.name || null,
        passwordHash: args.data.passwordHash,
        createdAt: now,
        updatedAt: now,
      };

      data.users.push(newUser);

      let createdProfile: DBRiskProfile | null = null;
      if (args.data.riskProfile?.create) {
        createdProfile = {
          id: generateId(),
          userId,
          defaultEquity: args.data.riskProfile.create.defaultEquity ?? 50000,
          defaultRiskPercent: args.data.riskProfile.create.defaultRiskPercent ?? 1.0,
          defaultLeverage: args.data.riskProfile.create.defaultLeverage ?? 1.0,
          propFirmMode: args.data.riskProfile.create.propFirmMode ?? true,
          maxDailyLossPercent: args.data.riskProfile.create.maxDailyLossPercent ?? 5.0,
          createdAt: now,
          updatedAt: now,
        };
        data.risk_profiles.push(createdProfile);
      }

      saveDB(data);

      if (args.include?.riskProfile) {
        return { ...newUser, riskProfile: createdProfile };
      }
      return newUser;
    },
  },

  tradeSetup: {
    async findMany(args?: { where?: { userId?: string | null }; orderBy?: { createdAt?: "asc" | "desc" }; take?: number }) {
      const data = ensureDB();
      let list = data.trade_setups;

      if (args?.where?.userId !== undefined) {
        list = list.filter((t) => t.userId === args.where?.userId);
      }

      if (args?.orderBy?.createdAt === "desc") {
        list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      if (args?.take) {
        list = list.slice(0, args.take);
      }

      return list;
    },

    async findUnique(args: { where: { id: string } }) {
      const data = ensureDB();
      return data.trade_setups.find((t) => t.id === args.where.id) || null;
    },

    async create(args: { data: Omit<DBTradeSetup, "id" | "createdAt" | "updatedAt"> }) {
      const data = ensureDB();
      const now = new Date().toISOString();
      const newTrade: DBTradeSetup = {
        id: generateId(),
        ...args.data,
        createdAt: now,
        updatedAt: now,
      };

      data.trade_setups.push(newTrade);
      saveDB(data);
      return newTrade;
    },

    async update(args: { where: { id: string }; data: Partial<DBTradeSetup> }) {
      const data = ensureDB();
      const index = data.trade_setups.findIndex((t) => t.id === args.where.id);
      if (index === -1) throw new Error("Trade setup not found");

      data.trade_setups[index] = {
        ...data.trade_setups[index],
        ...args.data,
        updatedAt: new Date().toISOString(),
      };

      saveDB(data);
      return data.trade_setups[index];
    },

    async delete(args: { where: { id: string } }) {
      const data = ensureDB();
      data.trade_setups = data.trade_setups.filter((t) => t.id !== args.where.id);
      saveDB(data);
      return true;
    },
  },
};
