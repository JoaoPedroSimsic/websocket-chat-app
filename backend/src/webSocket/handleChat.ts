import { Server, Socket } from 'socket.io';
import prisma from '../config/prismaClient'

const registerHandleChat = (io: Server) => {
	io.on('connection', (socket: Socket) => {
		socket.on('room:join', (roomId: int) => {

		})

		socket.on('chat:message', async (message: { roomId: int, content: string }) => {

		})

		socket.on('room:leave', (roomId: int) => {

		})

		socket.on('disconnect', () => {

		})
	})
}
