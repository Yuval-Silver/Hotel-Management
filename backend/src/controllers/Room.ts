import { NextFunction, Request, Response, Router } from "express";
import UserModel, { Department, InvalidUserCredentialsError, UnauthorizedUserError, User, UserRole } from "../models/User.js";
import RoomModel, { RoomState, RoomTypeIsNotEmptyError } from "../models/Room.js";

const router = Router();

interface AuthedRequest extends Request {
	user: User;
}

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management
 */

/**
 * Middleware to verify user and extract user information from JWT token.
 */
async function verifyUser(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	
	const token = authHeader.split(" ")[1];
	const payload = UserModel.getJwtPayload(token);
	
	if (!payload) {
		throw new InvalidUserCredentialsError()
	}
	
	const user = await UserModel.getUser(payload.user);
	if (!user) {
		throw new InvalidUserCredentialsError()
	}
	
	(req as AuthedRequest).user = user;
	next();
}

/**
 * @swagger
 * /create-type/{type}:
 *   post:
 *     summary: Create a new room type
 *     tags: [Rooms]
 *     parameters:
 *       - name: type
 *         in: path
 *         description: Type of the room to create
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Room type description
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of the room type
 *     responses:
 *       201:
 *         description: Room type created successfully
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Invalid input
 */
router.post("/create-type/:type", verifyUser, async (req: Request, res: Response, next: NextFunction) => {
	const { user } = req as any;
	const { type } = req.params;
	const { description } = req.body;
	
	if (user.role !== UserRole.Admin || user.department !== Department.FrontDesk) {
		throw new UnauthorizedUserError()
	}
	
	await RoomModel.createType(type, description);
	res.json({ message: `Room type ${type} created successfully` });
});

/**
 * @swagger
 * /create-room:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     requestBody:
 *       description: Room details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of the room
 *               room:
 *                 type: number
 *                 description: The room number
 *     responses:
 *       201:
 *         description: Room created successfully
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Invalid input
 */
router.post("/create-room", verifyUser, async (req: Request, res: Response, next: NextFunction) => {
	const { user } = req as any;
	const { type, room } = req.body;
	
	if (user.role !== UserRole.Admin || user.department !== Department.FrontDesk) {
		throw new UnauthorizedUserError()
	}
	
	await RoomModel.createRoom(room, type);
	res.json({ message: `Room ${room} created successfully` });
});

/**
 * @swagger
 * /remove-type/{type}:
 *   post:
 *     summary: Remove a room type
 *     tags: [Rooms]
 *     parameters:
 *       - name: type
 *         in: path
 *         description: Room type to remove
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: New room type for rooms of the removed type
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newType:
 *                 type: string
 *                 description: The new room type to set on rooms of the removed type
 *     responses:
 *       200:
 *         description: Room type removed successfully
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Invalid input
 */
router.post("/remove-type/:type", verifyUser, async (req: Request, res: Response, next: NextFunction) => {
	const { user } = req as any;
	const { type } = req.params;
	const { newType } = req.body;
	
	if (user.role !== UserRole.Admin || user.department !== Department.FrontDesk) {
		return res.status(403).json({ message: "Forbidden" });
	}
	
	const roomsOfType = await RoomModel.getRoomsByType(type);
	if (roomsOfType.length > 0) {
		throw new RoomTypeIsNotEmptyError(type)
	}
	
	await RoomModel.removeType(type, newType);
	res.json({ message: `Room type ${type} removed successfully` });
});

/**
 * @swagger
 * /remove-room/{room}:
 *   post:
 *     summary: Remove a room
 *     tags: [Rooms]
 *     parameters:
 *       - name: room
 *         in: path
 *         description: Room number to remove
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Room removed successfully
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Invalid input
 */
router.post("/remove-room/:room", verifyUser, async (req: Request, res: Response, next: NextFunction) => {
	const { user } = req as any;
	const { room } = req.params;
	
	if (user.role !== UserRole.Admin || user.department !== Department.FrontDesk) {
		return res.status(403).json({ message: "Forbidden" });
	}
	
	await RoomModel.removeRoom(Number(room));
	res.json({ message: `Room ${room} removed successfully` });
});

/**
 * @swagger
 * /room:
 *   get:
 *     summary: Get rooms with optional filtering
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter rooms by type
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           enum: [Clean, Inspected, Dirty, OutOfOrder]
 *         description: Filter rooms by state
 *       - in: query
 *         name: occupied
 *         schema:
 *           type: boolean
 *         description: Filter rooms by occupation status
 *       - in: query
 *         name: reservationId
 *         schema:
 *           type: number
 *         description: Filter rooms by reservation ID
 *     responses:
 *       200:
 *         description: Rooms retrieved successfully
 *       400:
 *         description: Invalid input
 */
router.get("/room", verifyUser, async (req: Request, res: Response, next: NextFunction) => {
	const { type, state, occupied, reservationId } = req.query;
	
	const filters: any = {
		type: type ? String(type) : undefined,
		state: state ? String(state) as RoomState : undefined,
		occupied: occupied ? occupied === "true" : undefined,
		reservationId: reservationId ? Number(reservationId) : undefined
	};
	
	const rooms = await RoomModel.getFilteredRooms(filters);
	
	res.json(rooms);
});

export const RoomsRouter = router;
