import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { weatherProcedure } from "./routes/rapidapi/weather/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  rapidapi: createTRPCRouter({
    weather: weatherProcedure,
  }),
});

export type AppRouter = typeof appRouter;