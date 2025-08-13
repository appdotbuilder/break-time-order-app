import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schema types
import { 
  createOrderInputSchema, 
  currentOrderStateSchema,
  type OrderSummary,
  type BreakTimeItem 
} from './schema';

// Import handlers
import { createOrder } from './handlers/create_order';
import { getOrders } from './handlers/get_orders';
import { getOrderById } from './handlers/get_order_by_id';
import { getAvailableItems } from './handlers/get_available_items';
import { validateOrderState } from './handlers/validate_order_state';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Get available break time items
  getAvailableItems: publicProcedure
    .query((): Promise<BreakTimeItem[]> => getAvailableItems()),

  // Create a new order with items
  createOrder: publicProcedure
    .input(createOrderInputSchema)
    .mutation(({ input }): Promise<OrderSummary> => createOrder(input)),

  // Get all orders with their items
  getOrders: publicProcedure
    .query((): Promise<OrderSummary[]> => getOrders()),

  // Get a specific order by ID
  getOrderById: publicProcedure
    .input(z.number())
    .query(({ input }): Promise<OrderSummary | null> => getOrderById(input)),

  // Validate current order state before submission
  validateOrderState: publicProcedure
    .input(currentOrderStateSchema)
    .query(({ input }): Promise<boolean> => validateOrderState(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();