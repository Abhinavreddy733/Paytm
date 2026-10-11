import express from 'express'
import { AuthMiddleware, sendResponse } from '../middleware'
import { ResponseStatus, type ResponseStatusType } from '../responseStatus'
import { prisma } from "../db";
import * as z from "zod";
const router = express.Router();

// Zod Schema

const TransactionSchema = z.object({
    senderId: z.number(),
    receiverId: z.number(),
    amount: z.number()
})

router.post('/transaction', async (req, res) => {
    const { data, success } = TransactionSchema.safeParse(req.body);

    if (!success) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST);
    }

    const senderId = data.senderId;
    const receiverId = data.receiverId;
    const amount = data.amount;

    return prisma.$transaction(async (tx) => {
        const debit = await tx.user.updateMany({
            where: { id: senderId, amount: { gte: amount } },
            data: { amount: { decrement: amount } },
        });

        if (debit.count === 0) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST);
        }

        await tx.user.update({
            where: { id: receiverId },
            data: { amount: { increment: amount } },
        });

        return tx.transactions.create({
            data: {
                senderId,
                receiverId,
                amount,
                transactionStatus: "SUCCESS",
                transactionTime: new Date()
            },
        });
    })
})


export default router