import jwt, { JwtPayload } from 'jsonwebtoken';
import environment from '../utils/environment.js';
import logger from '../utils/logger.js';
import mongoose, { Schema } from 'mongoose';

export class UserDoesNotExistError extends Error {}
export class CreatorDoesNotExistError extends Error {}
export class CreatorIsNotAdminError extends Error {}
export class JwtTokenIsNotValidError extends Error {}

export enum UserRole {
	Admin,
	User,
}

interface UserPayload {
	user: string,
	pass: string,
}

interface User {
	user: string,
	pass: string,
	role: UserRole,
	token: string,
}

// MongoDB user schema.
const userSchema = new Schema<User>({
	user: String,
	pass: String,
	role: {
		type: Number,
		enum: Object.values(UserRole),
		default: UserRole.User,
	},
	token: String,
});
// Creating the user model.
const UserModel = mongoose.model<User>("User", userSchema);

function jwtValidate(token: string): JwtPayload | null {
	try {
		const decoded = jwt.verify(token, environment.jwtSecret);
		if (typeof decoded !== "string") {
			return decoded as UserPayload;
		}
	} catch (err) {
		logger.error(`Failed to validate jwt token ${token}`);
	}
	return null;
}

async function authenticate(username: string, password: string): Promise<string> {
	const user = await UserModel.findOne({ user: username, pass: password });
	if (!user) {
		throw new UserDoesNotExistError();
	}
	return user.token as string;
}

/**
 * @returns The JWT Token that was created if a user has been created.
 * Returns null if there was an error in the user creation.
 */
async function create(username: string, password: string, creatorToken: string): Promise<string> {
	if (!jwtValidate(creatorToken)) {
		throw new JwtTokenIsNotValidError();
	}
	
	const creator = await UserModel.findOne({ token: creatorToken });
	if (!creator) {
		throw new CreatorDoesNotExistError();
	}
	if (creator.role !== UserRole.Admin) {
		throw new CreatorIsNotAdminError();
	}
	
	// The user is an admin so they can create a new user.
	const payload: UserPayload = {
		user: username,
		pass: password,
	};
	const token = jwt.sign(payload, environment.jwtSecret);
	await UserModel.create({
		user: username,
		pass: password,
		role: UserRole.User,
		token: token,
	});
	
	return token;
}

export const Users = {
	create,
	authenticate,
};
