import express from 'express'
import { sendResponse, verifyPinMiddleware } from '../middleware'
import { ResponseStatus, type ResponseStatusType } from '../responseStatus'
import { prisma } from "../db";
import * as z from "zod";
const router = express.Router();

// Zod Schema

const TransactionSchema = z.object({
    senderPhoneNumber: z.number(),
    receiverPhoneNumber: z.number(),
    amount: z.number(),
    accountPin: z.number()
})

const paramsSchema = z.object({
    transactionId: z.coerce.number().int().positive(),
});

router.post('/transaction', verifyPinMiddleware, async (req, res) => {
    const { data, success } = TransactionSchema.safeParse(req.body);

    if (!success) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST);
    }

    const senderPhoneNumber = data.senderPhoneNumber;
    const receiverPhoneNumber = data.receiverPhoneNumber;
    const amount = data.amount;
    const transaction = await prisma.$transaction(async (tx) => {
        const debit = await tx.user.updateMany({
            where: { phoneNumber: senderPhoneNumber, balance: { gte: amount } },
            data: { balance: { decrement: amount } },
        });

        if (debit.count === 0) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST);
        }

        const resp = await tx.user.update({
            where: { phoneNumber: receiverPhoneNumber },
            data: { balance: { increment: amount } },
        });

        return tx.transactions.create({
            data: {
                senderPhoneNumber,
                receiverPhoneNumber,
                amount,
                transactionStatus: "SUCCESS",
                transactionTime: new Date()
            },
        });
    })

    return sendResponse(res, ResponseStatus.SUCCESS, transaction);
})

router.get('/transactionDetails', async (req, res) => {
    //@ts-ignore
    const userId = req.user.id;

    const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: { phoneNumber: true },
    });

    if (!userData || userData.phoneNumber === null) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST);
    }

    const phone = userData.phoneNumber;

    const transactions = await prisma.transactions.findMany({
        where: {
            OR: [
                { senderPhoneNumber: phone },
                { receiverPhoneNumber: phone },
            ],
        },
        orderBy: [
            { transactionTime: 'desc' },
            { id: 'desc' },
        ],
    });

    const history = transactions.map((t) => ({
        ...t,
        type: t.senderPhoneNumber === phone ? 'SENT' : 'RECEIVED',
    }));

    return sendResponse(res, ResponseStatus.SUCCESS, history);
});

router.get('/transaction/:transactionId', async (req, res) => {
    const { data, success } = paramsSchema.safeParse(req.params);
    
    if (!success) return sendResponse(res, ResponseStatus.BAD_REQUEST);
    
    const transactionId = data.transactionId;
    
    //@ts-ignore
    const userId = req.user.id;
    const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: { phoneNumber: true },
    });

    if (!userData || userData.phoneNumber === null) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST);
    }

    const phone = userData.phoneNumber;

    const transactionData = await prisma.transactions.findFirst({
        where: {
            id: transactionId
        }
    });

    if (!transactionData) return sendResponse(res, ResponseStatus.NOT_FOUND);

    const result = {
        ...transactionData,
        type: transactionData.senderPhoneNumber === phone ? 'SENT' : 'RECEIVED',
    } 

    return sendResponse(res, ResponseStatus.SUCCESS, result);
})

router.get('/details', async (req, res) => {
    const userId = (req as any).user.id;

    const userData = await prisma.user.findFirst({
        where: { id: userId },
        select:{
            username: true,
            phoneNumber: true,
            balance: true
        }
    });

    if (!userData) return sendResponse(res, ResponseStatus.BAD_REQUEST);

    return sendResponse(res, ResponseStatus.SUCCESS, userData);
})


export default router