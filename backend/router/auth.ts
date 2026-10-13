import express from 'express'
import { SignJWT, jwtVerify } from 'jose'
import { AuthMiddleware, sendResponse } from '../middleware'
import { ResponseStatus, type ResponseStatusType } from '../responseStatus'
import { prisma } from "../db";
import * as z from "zod";
const router = express.Router();

//signIn, signup, 

const secret = new TextEncoder().encode("ABHINAV"!)

const AuthSchema = z.object({
    username: z.string(),
    password: z.string().min(6),
    accountPin: z.number(),
    phoneNumber: z.number()
})

router.post('/signup', async (req, res) => {
    const { data, success } = AuthSchema.safeParse(req.body);
    
    if (!success) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST);
    }

    const username = data.username;
    const password = await Bun.password.hash(data.password);
    const accountPin = data.accountPin;
    const phoneNumber = data.phoneNumber;

    return prisma.$transaction(async (tx) => {
        const user = await prisma.user.create({
            data: { username, password, accountPin, phoneNumber }
        })

        if (!user) {
            return sendResponse(res, ResponseStatus.INTERNAL_ERROR);
        }

        const token = await new SignJWT({ id: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret)

        return sendResponse(res, ResponseStatus.SUCCESS, token);
    })
})

router.post('/signin', async (req, res) => {
    
    const { data, success } = AuthSchema.safeParse(req.body);
    
    if (!success) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST);
    }

    const username = data.username;

    return prisma.$transaction(async (tx) => {
        const user = await prisma.user.findFirst({
            where: {username}
        })

        if (!user) {
            return sendResponse(res, ResponseStatus.NOT_FOUND);
        }

        const verifyPassword = await Bun.password.verify(data.password, user.password);

        if(!verifyPassword) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST);
        }

        const token = await new SignJWT({ id: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret)

        return sendResponse(res, ResponseStatus.SUCCESS, token);
    })
})

export default router