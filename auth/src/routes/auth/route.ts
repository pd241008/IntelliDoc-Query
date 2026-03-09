// auth/src/routes/user.routes.ts
import { Router } from "express";
import { syncUser } from "../../controllers/user_controller";
import { checkJwt } from "../../middleware/auth_middleware";

const router = Router();

// POST /api/users/sync-user
// We apply checkJwt here so the route is completely locked down
router.post("/sync-user", checkJwt, syncUser);
console.log("AUTH0_ISSUER_BASE_URL:", process.env.AUTH0_ISSUER_BASE_URL);
console.log("AUTH0_AUDIENCE:", process.env.AUTH0_AUDIENCE);

export default router;
