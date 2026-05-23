// auth/src/routes/user.routes.ts
import { Router } from "express";
import { syncUser } from "../../controllers/user_controller";
import { checkJwt } from "../../middleware/auth_middleware";

const router = Router();

// POST /api/users/sync-user
// We apply checkJwt here so the route is completely locked down
router.post("/sync-user", checkJwt, syncUser);

export default router;
