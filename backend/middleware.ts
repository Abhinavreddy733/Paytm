import express from 'express'
import { jwtVerify } from 'jose'
import type { Response, Request, NextFunction } from 'express'
import { ResponseStatus,type ResponseStatusType } from './responseStatus'
import { prisma } from "./db";
const secret = new TextEncoder().encode("ABHINAV"!)

export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    
    if (req.path === '/signin') {
        
        const { username, password } = req.body;
        
        if(!username || !password) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST);
        }
        
        return next()
    }
    const {username, password, accountPin, phoneNumber} = req.body;

    if(!username || !password || !accountPin || !phoneNumber) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST);
    }
    next();
}

export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) return sendResponse(res, ResponseStatus.UNAUTHORIZED)

    try {
        const { payload } = await jwtVerify(token, secret);
        
        (req as any).user = payload // add a type augmentation for req.user
        
        next()
    } catch {
        return sendResponse(res, ResponseStatus.UNAUTHORIZED)
    }
}

export const verifyPinMiddleware = async(req: Request, res:Response, next: NextFunction) => {
    //@ts-ignore
    const userId = req.user.id;
    const senderPhoneNumber = req.body.senderPhoneNumber;
    const accountPin = req.body.accountPin

    const userData = await prisma.user.findFirst({
        where: {id : userId}
    })

    if(!userData) {
        return sendResponse(res, ResponseStatus.NOT_FOUND)
    }

    if(userData?.phoneNumber != senderPhoneNumber) {
        return sendResponse(res, ResponseStatus.UNAUTHORIZED)
    }

    if(accountPin != userData.accountPin) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST)
    }

    next();
}

export const sendResponse = (res: Response, rs: ResponseStatusType, data?: unknown) => {

    if (rs.status === 204) return res.status(204).send();

    return res.status(rs.status).json({
        status: rs.status,
        code: rs.code,
        message: rs.message,
        ...(data !== undefined && { data }),
    });
}